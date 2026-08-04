import time
import uuid
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/templates", tags=["templates"])


def to_response(t: models.TemplateModel) -> schemas.TemplateResponse:
    return schemas.TemplateResponse(
        id=t.id,
        title=t.title,
        category=t.category,
        description=t.description,
        thumbnail=t.thumbnail,
        duration=t.duration,
        difficulty=t.difficulty,
        audienceSize=t.audience_size,
        popularity=t.popularity,
        ratingCount=t.rating_count,
        tags=t.tags or [],
        status=t.status,
        isFeatured=t.is_featured,
        supportedOutputs=t.supported_outputs or [],
        defaultBrand=t.default_brand,
        playerJourney=t.player_journey,
        createdByUserId=t.created_by_user_id,
        createdAt=t.created_at,
    )


@router.get("/", response_model=List[schemas.TemplateResponse])
def list_templates(db: Session = Depends(get_db)):
    seed_templates(db)
    templates = db.query(models.TemplateModel).order_by(models.TemplateModel.created_at.desc()).all()
    return [to_response(t) for t in templates]



@router.post("/", response_model=schemas.TemplateResponse)
def create_template(data: schemas.TemplateCreate, db: Session = Depends(get_db)):
    tags = data.tags if data.tags is not None else ["Custom"]
    tpl = models.TemplateModel(
        id=f"tpl-{int(time.time() * 1000)}-{uuid.uuid4().hex[:6]}",
        title=data.title,
        category=data.category or "Games",
        description=data.description or "",
        thumbnail=data.thumbnail or "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80",
        duration=data.duration or "1-3 mins",
        difficulty=data.difficulty or "Easy",
        audience_size="1 - 10,000",
        popularity=5.0,
        rating_count=1,
        tags=tags,
        status=data.status or "Draft",
        is_featured=False,
        supported_outputs=["Mobile Web", "LED Screen", "TV Display"],
        created_by_user_id=data.createdByUserId,
    )
    db.add(tpl)
    db.commit()
    db.refresh(tpl)
    return to_response(tpl)


def seed_templates(db: Session):
    if not db.query(models.TemplateModel).filter_by(id="selfie-wall").first():
        db.add(models.TemplateModel(
            id="selfie-wall",
            title="Live Fan Selfie Wall",
            category="Photo Experiences",
            description=(
                "Real-time digital selfie wall for stadium screens and venues. Fans scan Jumbotron QR code "
                "to upload photos, which enter an AI & Admin Moderation Queue before live broadcast."
            ),
            thumbnail="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80",
            duration="3-5 mins",
            difficulty="Easy",
            audience_size="100 - 100,000+",
            popularity=4.9,
            rating_count=488,
            tags=["Mosaic Wall", "Selfie Upload", "AI Moderation Queue", "Jumbotron Broadcast"],
            status="Active Backend",
            is_featured=True,
            supported_outputs=["Mobile Web", "LED Screen", "Projector", "TV Display", "Jumbotron"],
            default_brand="coca-cola",
            player_journey=[
                "1. Scan QR Code displayed on stadium Jumbotron screen.",
                "2. Arrive at Mobile Event Portal displaying active venue engagements.",
                '3. Select "Live Fan Selfie Wall [ACTIVE]".',
                '4. Snap/upload selfie photo, apply brand stickers, and tap "Send Selfie".',
                "5. Photo arrives in FanForge Platform Moderation Queue for instant review.",
                "6. Once accepted by moderator, selfie animates live onto the Big Screen Mosaic!",
            ],
            created_by_user_id=None,
        ))

    if not db.query(models.TemplateModel).filter_by(id="live-poll").first():
        db.add(models.TemplateModel(
            id="live-poll",
            title="Real-Time Stadium Live Poll",
            category="Voting",
            description=(
                "Interactive halftime and match-day live voting for stadium big screens. Fans scan the QR code "
                "on Jumbotrons or mobile phones to cast votes, driving live animated percentage bars and vote counters in real-time."
            ),
            thumbnail="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80",
            duration="1-3 mins",
            difficulty="Easy",
            audience_size="100 - 100,000+",
            popularity=4.95,
            rating_count=512,
            tags=["Live Poll", "Jumbotron Voting", "Halftime Question", "Real-Time WebSocket", "Audience Engagement"],
            status="Active Backend",
            is_featured=True,
            supported_outputs=["Mobile Web", "LED Screen", "Projector", "TV Display", "Jumbotron"],
            default_brand="coca-cola",
            player_journey=[
                "1. Scan QR Code displayed on central stadium screen.",
                "2. Mobile Fan Zone displays active live match question and multi-choice options.",
                "3. Tap choice to cast instant vote.",
                "4. Live vote count and animated percentage bars update instantly across all stadium screens over WebSockets!",
            ],
            created_by_user_id=None,
        ))

    if not db.query(models.TemplateModel).filter_by(id="reaction-wall").first():
        db.add(models.TemplateModel(
            id="reaction-wall",
            title="Live Fan Emoji Reaction Wall",
            category="Audience Participation",
            description=(
                "Real-time emoji reaction stream for stadium big screens and venue Jumbotrons. Fans tap reaction emojis "
                "(🔥, 👏, 🚀, ❤️, ⚡, 🎉, 🏆) on their mobile smartphones to burst floating emoji particles live across the screen!"
            ),
            thumbnail="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
            duration="1-3 mins",
            difficulty="Easy",
            audience_size="100 - 100,000+",
            popularity=4.98,
            rating_count=620,
            tags=["Emoji Stream", "Reaction Wall", "Particle Effects", "Real-Time WebSocket", "Jumbotron Broadcast"],
            status="Active Backend",
            is_featured=True,
            supported_outputs=["Mobile Web", "LED Screen", "Projector", "TV Display", "Jumbotron"],
            default_brand="coca-cola",
            player_journey=[
                "1. Scan QR Code displayed on central stadium Jumbotron screen.",
                "2. Mobile Fan Zone displays live match reaction buttons (🔥, 👏, 🚀, ❤️, ⚡, 🎉).",
                "3. Tap any emoji reaction button to express match energy.",
                "4. Emoji particles immediately burst and float upward live across all venue screens over WebSockets!",
            ],
            created_by_user_id=None,
        ))

    if not db.query(models.TemplateModel).filter_by(id="memory-challenge").first():
        db.add(models.TemplateModel(
            id="memory-challenge",
            title="Memory Challenge",
            category="Games",
            description=(
                "Interactive tile-matching memory game for stadium big screens and venue mobile apps. "
                "Fans memorize brand icons and card locations under time pressure to unlock instant prizes and dynamic leaderboard ranks."
            ),
            thumbnail="https://images.unsplash.com/photo-1611996575749-79a3a250f948?auto=format&fit=crop&w=600&q=80",
            duration="1-3 mins",
            difficulty="Medium",
            audience_size="100 - 100,000+",
            popularity=4.91,
            rating_count=340,
            tags=["Memory Game", "Tile Matching", "Gamification", "Sponsor Rewards", "Fan Engagement"],
            status="Active Backend",
            is_featured=True,
            supported_outputs=["Mobile Web", "LED Screen", "Projector", "TV Display", "Jumbotron"],
            default_brand="coca-cola",
            player_journey=[
                "1. Scan QR Code displayed on venue screens or access inside match-day mobile app.",
                "2. A grid of hidden sponsor & team cards is displayed briefly for 5 seconds.",
                "3. Cards flip face down, initiating the memory challenge countdown timer.",
                "4. Tap matching pairs in succession to build dynamic combo multipliers and score points.",
                "5. Complete the grid before time expires to claim instant sponsor coupon rewards!",
            ],
            created_by_user_id=None,
        ))
        db.commit()

    db.commit()




