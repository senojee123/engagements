import struct
import json
import io
from PIL import Image

def optimize_glb(input_path, output_path, max_dim=1024, jpeg_quality=85):
    with open(input_path, 'rb') as f:
        data = f.read()

    magic, version, length = struct.unpack('<III', data[:12])
    assert magic == 0x46546c67, "Not a GLB file"

    # Chunk 0: JSON
    json_len, json_type = struct.unpack('<II', data[12:20])
    json_bytes = data[20:20+json_len]
    gltf = json.loads(json_bytes.decode('utf-8'))

    # Chunk 1: BIN
    bin_start = 20 + json_len
    bin_len, bin_type = struct.unpack('<II', data[bin_start:bin_start+8])
    bin_bytes = bytearray(data[bin_start+8:bin_start+8+bin_len])

    buffer_views = gltf['bufferViews']
    images = gltf.get('images', [])

    new_bin_bytes = bytearray()
    
    # We will rebuild the BIN buffer and update bufferView byteOffsets and byteLengths
    # First, separate image bufferViews from mesh/anim bufferViews
    image_bv_indices = set(img['bufferView'] for img in images if 'bufferView' in img)
    
    # Map old bufferView index to new data in new_bin_bytes
    bv_offset_map = {}

    # Copy non-image bufferViews first
    for idx, bv in enumerate(buffer_views):
        if idx not in image_bv_indices:
            offset = bv.get('byteOffset', 0)
            length = bv['byteLength']
            chunk = bin_bytes[offset:offset+length]
            
            # Align 4 bytes
            while len(new_bin_bytes) % 4 != 0:
                new_bin_bytes.append(0)
                
            new_offset = len(new_bin_bytes)
            new_bin_bytes.extend(chunk)
            bv['byteOffset'] = new_offset
            bv['byteLength'] = len(chunk)

    # Process and compress images
    for img in images:
        if 'bufferView' not in img:
            continue
        bv_idx = img['bufferView']
        bv = buffer_views[bv_idx]
        offset = bv.get('byteOffset', 0)
        length = bv['byteLength']
        
        img_raw = bin_bytes[offset:offset+length]
        im = Image.open(io.BytesIO(img_raw))
        orig_w, orig_h = im.size
        print(f"Processing image '{img.get('name')}' original format={im.format}, mode={im.mode}, size={orig_w}x{orig_h}")

        # Resize if larger than max_dim
        if orig_w > max_dim or orig_h > max_dim:
            ratio = min(max_dim / orig_w, max_dim / orig_h)
            new_w = int(orig_w * ratio)
            new_h = int(orig_h * ratio)
            im = im.resize((new_w, new_h), Image.Resampling.LANCZOS)
            print(f"  Resized to {new_w}x{new_h}")

        out_buf = io.BytesIO()
        # If normal map or has transparency, keep PNG or optimized PNG
        if im.mode == 'RGBA' or 'Normal' in img.get('name', ''):
            im.save(out_buf, format='PNG', optimize=True)
            img['mimeType'] = 'image/png'
        else:
            if im.mode != 'RGB':
                im = im.convert('RGB')
            im.save(out_buf, format='JPEG', quality=jpeg_quality, optimize=True)
            img['mimeType'] = 'image/jpeg'

        new_img_bytes = out_buf.getvalue()
        print(f"  New image size: {len(new_img_bytes)} bytes (was {length} bytes)")

        # Align 4 bytes
        while len(new_bin_bytes) % 4 != 0:
            new_bin_bytes.append(0)

        new_offset = len(new_bin_bytes)
        new_bin_bytes.extend(new_img_bytes)
        bv['byteOffset'] = new_offset
        bv['byteLength'] = len(new_img_bytes)

    # Re-align total BIN length to 4-byte boundary
    while len(new_bin_bytes) % 4 != 0:
        new_bin_bytes.append(0)

    # Encode updated JSON
    new_json_bytes = json.dumps(gltf, separators=(',', ':')).encode('utf-8')
    while len(new_json_bytes) % 4 != 0:
        new_json_bytes += b' '

    new_total_len = 12 + 8 + len(new_json_bytes) + 8 + len(new_bin_bytes)

    header = struct.pack('<III', magic, version, new_total_len)
    json_chunk_hdr = struct.pack('<II', len(new_json_bytes), 0x4E4F534A)
    bin_chunk_hdr = struct.pack('<II', len(new_bin_bytes), 0x004E4942)

    with open(output_path, 'wb') as f:
        f.write(header)
        f.write(json_chunk_hdr)
        f.write(new_json_bytes)
        f.write(bin_chunk_hdr)
        f.write(new_bin_bytes)

    print(f"Successfully wrote optimized GLB to {output_path}: {new_total_len} bytes ({round(new_total_len/1024/1024, 2)} MB)")

if __name__ == '__main__':
    optimize_glb('public/games/lane-dash/assets/character/Ch09_nonPBR.glb', 'public/games/lane-dash/assets/character/Ch09_nonPBR.glb', max_dim=1024)
