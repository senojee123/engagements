import time
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from deps import get_current_user, require_admin

router = APIRouter(prefix="/api/brand-kits", tags=["brand-kits"])


def to_response(b: models.BrandKitModel) -> schemas.BrandKitResponse:
    return schemas.BrandKitResponse(
        id=b.id,
        name=b.name,
        logo=b.logo,
        primaryColor=b.primary_color,
        secondaryColor=b.secondary_color,
        accentColor=b.accent_color,
        bgGradient=b.bg_gradient,
        gradientBg=b.bg_gradient,
        logoText=b.logo_text,
        bgColor=b.bg_color,
        cardBg=b.card_bg,
        textColor=b.text_color,
        fontFamily=b.font_family,
        buttonRadius=b.button_radius,
        buttonClass=b.button_class,
        collectibleName=b.collectible_name,
        collectibleIcon=b.collectible_icon,
        collectiblePoints=b.collectible_points,
        obstacleName=b.obstacle_name,
        obstacleIcon=b.obstacle_icon,
        powerUpName=b.power_up_name,
        powerUpIcon=b.power_up_icon,
        runnerSprite=b.runner_sprite,
        tagline=b.tagline,
        themeBadge=b.theme_badge,
        audioTheme=b.audio_theme,
    )


def apply_fields(brand: models.BrandKitModel, data: dict):
    field_map = {
        "primaryColor": "primary_color",
        "secondaryColor": "secondary_color",
        "accentColor": "accent_color",
        "bgGradient": "bg_gradient",
        "logoText": "logo_text",
        "bgColor": "bg_color",
        "cardBg": "card_bg",
        "textColor": "text_color",
        "fontFamily": "font_family",
        "buttonRadius": "button_radius",
        "buttonClass": "button_class",
        "collectibleName": "collectible_name",
        "collectibleIcon": "collectible_icon",
        "collectiblePoints": "collectible_points",
        "obstacleName": "obstacle_name",
        "obstacleIcon": "obstacle_icon",
        "powerUpName": "power_up_name",
        "powerUpIcon": "power_up_icon",
        "runnerSprite": "runner_sprite",
        "tagline": "tagline",
        "themeBadge": "theme_badge",
        "audioTheme": "audio_theme",
    }
    for key, value in data.items():
        column = field_map.get(key, key)
        setattr(brand, column, value)


@router.get("/", response_model=List[schemas.BrandKitResponse])
def list_brand_kits(db: Session = Depends(get_db), current_user: models.UserModel = Depends(get_current_user)):
    brands = db.query(models.BrandKitModel).all()
    return [to_response(b) for b in brands]


@router.post("/", response_model=schemas.BrandKitResponse)
def create_brand_kit(data: schemas.BrandKitCreate, db: Session = Depends(get_db), current_user: models.UserModel = Depends(require_admin)):
    brand = models.BrandKitModel(id=f"brand-{int(time.time() * 1000)}-{uuid.uuid4().hex[:6]}")
    apply_fields(brand, data.model_dump())
    db.add(brand)
    db.commit()
    db.refresh(brand)
    return to_response(brand)


@router.put("/{brand_id}", response_model=schemas.BrandKitResponse)
def update_brand_kit(brand_id: str, data: schemas.BrandKitUpdate, db: Session = Depends(get_db), current_user: models.UserModel = Depends(require_admin)):
    brand = db.query(models.BrandKitModel).filter(models.BrandKitModel.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand kit not found")

    apply_fields(brand, data.model_dump(exclude_unset=True))
    db.commit()
    db.refresh(brand)
    return to_response(brand)


@router.delete("/{brand_id}")
def delete_brand_kit(brand_id: str, db: Session = Depends(get_db), current_user: models.UserModel = Depends(require_admin)):
    brand = db.query(models.BrandKitModel).filter(models.BrandKitModel.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand kit not found")

    db.delete(brand)
    db.commit()
    return {"status": "success"}


SEED_BRAND_KITS = [
    dict(id="coca-cola", name="Coca-Cola", logo="https://upload.wikimedia.org/wikipedia/commons/c/ce/Coca-Cola_logo.svg",
         logo_text="Coca-Cola", primary_color="#E61C24", secondary_color="#FFFFFF", accent_color="#F40009",
         bg_color="#110203", card_bg="#1F0608", text_color="#FFFFFF", bg_gradient="from-red-950 via-rose-900 to-red-900",
         button_class="bg-red-600 hover:bg-red-700 text-white shadow-red-900/50",
         collectible_name="Coke Can", collectible_icon="🥤", collectible_points="+100 pts",
         obstacle_name="Ice Cube Trap", obstacle_icon="🧊", power_up_name="Sparkling Fizz Booster", power_up_icon="✨",
         runner_sprite="🏃🏻‍♂️", tagline="Real Magic in Every Rush", theme_badge="Classic Red Theme",
         audio_theme="Upbeat Stadium Pop"),
    dict(id="pepsi", name="Pepsi", logo="https://upload.wikimedia.org/wikipedia/commons/0/0f/Pepsi_logo_2014.svg",
         logo_text="Pepsi", primary_color="#0051A5", secondary_color="#E61C24", accent_color="#00A3E0",
         bg_color="#020C1B", card_bg="#05162E", text_color="#FFFFFF", bg_gradient="from-blue-950 via-slate-900 to-indigo-950",
         button_class="bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/50",
         collectible_name="Pepsi Zero Bottle", collectible_icon="🥤", collectible_points="+100 pts",
         obstacle_name="Spill Hazard", obstacle_icon="🌊", power_up_name="Maximum Velocity", power_up_icon="⚡",
         runner_sprite="🏃🏽‍♀️", tagline="Thirsty for More", theme_badge="Electric Blue Theme",
         audio_theme="Electronic Dance"),
    dict(id="red-bull", name="Red Bull", logo="https://upload.wikimedia.org/wikipedia/en/f/f5/RedBullEnergyDrink.svg",
         logo_text="Red Bull", primary_color="#FFCC00", secondary_color="#001A4D", accent_color="#D80027",
         bg_color="#0B0418", card_bg="#120A24", text_color="#FFFFFF", bg_gradient="from-slate-950 via-indigo-950 to-amber-950",
         button_radius="20px", button_class="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-amber-500/30",
         collectible_name="Red Bull Can", collectible_icon="🔋", collectible_points="+150 pts",
         obstacle_name="Gravity Cone", obstacle_icon="⚠️", power_up_name="Gives You Wings", power_up_icon="🦅",
         runner_sprite="🏃🏼‍♂️", tagline="Gives You Wings", theme_badge="Energy Yellow & Navy",
         audio_theme="High-Octane Rock"),
    dict(id="sprite", name="Sprite", logo="https://upload.wikimedia.org/wikipedia/commons/b/b9/Sprite_Logo.svg",
         logo_text="Sprite", primary_color="#008B47", secondary_color="#FFDD00", accent_color="#00B140",
         bg_color="#011A0E", card_bg="#042A18", text_color="#FFFFFF", bg_gradient="from-emerald-950 via-teal-950 to-slate-950",
         button_class="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-emerald-500/30",
         collectible_name="Lemon Slice", collectible_icon="🍋", collectible_points="+120 pts",
         obstacle_name="Heat Wave", obstacle_icon="🔥", power_up_name="Crisp Refreshment", power_up_icon="🧊",
         runner_sprite="🏃🏾‍♂️", tagline="Obey Your Thirst", theme_badge="Lime & Lemon Green",
         audio_theme="Tropical Synth"),
    dict(id="dialog", name="Dialog", logo="https://upload.wikimedia.org/wikipedia/commons/0/05/Dialog_Axiata_logo.svg",
         logo_text="Dialog Axiata", primary_color="#F26522", secondary_color="#00A896", accent_color="#FFD100",
         bg_color="#170903", card_bg="#2B1207", text_color="#FFFFFF", bg_gradient="from-orange-950 via-slate-900 to-stone-950",
         button_radius="14px", button_class="bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-orange-500/30",
         collectible_name="5G Data Badge", collectible_icon="📡", collectible_points="+200 pts",
         obstacle_name="Signal Jammer", obstacle_icon="🚫", power_up_name="Hyper Turbo 5G", power_up_icon="⚡",
         runner_sprite="🏃🏻‍♀️", tagline="The Future is Today", theme_badge="Telecom Orange & Teal",
         audio_theme="Futuristic Cyber"),
    dict(id="toyota", name="Toyota", logo="https://upload.wikimedia.org/wikipedia/commons/9/9d/Toyota_carlogo.svg",
         logo_text="Toyota GR", primary_color="#EB0A1E", secondary_color="#000000", accent_color="#D10014",
         bg_color="#0F0F12", card_bg="#1A1A20", text_color="#FFFFFF", bg_gradient="from-neutral-950 via-rose-950 to-slate-950",
         button_radius="12px", button_class="bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-rose-900/50",
         collectible_name="Racing Wheel", collectible_icon="🏎️", collectible_points="+150 pts",
         obstacle_name="Pothole Trap", obstacle_icon="🛑", power_up_name="Hybrid Nitro Boost", power_up_icon="🔥",
         runner_sprite="🏎️", tagline="Let's Go Places", theme_badge="Gazoo Racing Red & Black",
         audio_theme="Motorsport Synth"),
    dict(id="nike", name="Nike", logo="https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg",
         logo_text="Nike", primary_color="#D4FF00", secondary_color="#111111", accent_color="#CCFF00",
         bg_color="#080808", card_bg="#18181B", text_color="#FFFFFF", bg_gradient="from-black via-zinc-900 to-neutral-950",
         button_radius="9999px", button_class="bg-lime-400 hover:bg-lime-500 text-black font-extrabold shadow-lime-400/30",
         collectible_name="Air Max Sneaker", collectible_icon="👟", collectible_points="+250 pts",
         obstacle_name="Hurdle Barrier", obstacle_icon="🚧", power_up_name="Just Do It Speed", power_up_icon="👟",
         runner_sprite="🏃🏿‍♂️", tagline="Just Do It", theme_badge="Volt Neon & Jet Black",
         audio_theme="Hip Hop Beats"),
    dict(id="apple", name="Apple", logo="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
         logo_text="Apple", primary_color="#2997FF", secondary_color="#FFFFFF", accent_color="#0071E3",
         bg_color="#0F1115", card_bg="#1C1E24", text_color="#FFFFFF", bg_gradient="from-slate-950 via-zinc-900 to-slate-900",
         button_radius="18px", button_class="bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-blue-500/30",
         collectible_name="iPhone 17 Pro", collectible_icon="📱", collectible_points="+300 pts",
         obstacle_name="Low Battery", obstacle_icon="🪫", power_up_name="MagSafe Charge", power_up_icon="🔋",
         runner_sprite="🏃🏼‍♀️", tagline="Think Different", theme_badge="Space Gray & Pro Blue",
         audio_theme="Minimal Ambient"),
]


def seed_brand_kits(db: Session):
    if db.query(models.BrandKitModel).first():
        return
    for brand in SEED_BRAND_KITS:
        db.add(models.BrandKitModel(**brand))
    db.commit()
