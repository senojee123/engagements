import time
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, Float, JSON, Text, ForeignKey
from database import Base

class SelfieModel(Base):
    __tablename__ = "selfies"

    id = Column(String, primary_key=True, index=True)
    uploader_name = Column(String, default="Stadium Fan")
    photo_url = Column(String, nullable=False)
    caption = Column(String, default="")
    status = Column(String, default="pending", index=True) # "pending" | "approved" | "rejected" | "flagged"
    ai_safety_score = Column(Integer, default=95)
    ai_risk_level = Column(String, default="Low Risk")
    ai_flags = Column(JSON, default=list)
    is_featured = Column(Boolean, default=False)
    brand_id = Column(String, default="brand-cocacola")
    approved_at = Column(Float, nullable=True) # Epoch timestamp in seconds
    created_at = Column(Float, default=lambda: time.time())


class IdleConfigModel(Base):
    __tablename__ = "idle_config"

    id = Column(String, primary_key=True, default="default_config")
    event_title = Column(String, default="Welcome to Dialog Family Day 2026")
    subtitle = Column(String, default="Interactive Experiences Powered by FanForge")
    event_logo = Column(String, default="https://upload.wikimedia.org/wikipedia/commons/c/ce/Coca-Cola_logo.svg")
    message_title = Column(String, default="FanZone Engagement Activities starting soon! Stay tuned to the big screen.")
    sponsor_logos = Column(JSON, default=list)


class BrandKitModel(Base):
    __tablename__ = "brand_kits"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    logo = Column(String, nullable=False)
    primary_color = Column(String, default="#E60000")
    secondary_color = Column(String, default="#000000")
    accent_color = Column(String, default="#FFD700")
    bg_gradient = Column(String, default="from-red-950 via-slate-950 to-black")
    logo_text = Column(String, default="")
    bg_color = Column(String, default="#000000")
    card_bg = Column(String, default="#111111")
    text_color = Column(String, default="#FFFFFF")
    font_family = Column(String, default="Inter, sans-serif")
    button_radius = Column(String, default="16px")
    button_class = Column(String, default="")
    collectible_name = Column(String, default="")
    collectible_icon = Column(String, default="")
    collectible_points = Column(String, default="+100 pts")
    obstacle_name = Column(String, default="")
    obstacle_icon = Column(String, default="")
    power_up_name = Column(String, default="")
    power_up_icon = Column(String, default="")
    runner_sprite = Column(String, default="")
    tagline = Column(String, default="")
    theme_badge = Column(String, default="")
    audio_theme = Column(String, default="")


class ScreenStateModel(Base):
    __tablename__ = "screen_state"

    id = Column(String, primary_key=True, default="main_screen")
    is_selfie_wall_active = Column(Boolean, default=False)
    active_brand_id = Column(String, default="brand-cocacola")
    active_mode = Column(String, default="idle") # "idle" | "selfie-wall" | "live-poll"
    active_poll_id = Column(String, default="poll-mvp")
    idle_config_json = Column(Text, nullable=True)


class PollModel(Base):
    __tablename__ = "polls"

    id = Column(String, primary_key=True, index=True)
    question = Column(String, nullable=False)
    category = Column(String, default="Match Day Halftime Poll")
    options = Column(JSON, default=list) # List of dicts: [{"id": "opt-1", "text": "...", "votes": 0, "color": "..."}]
    total_votes = Column(Integer, default=0)
    is_active = Column(Boolean, default=False)
    brand_id = Column(String, default="brand-cocacola")
    created_at = Column(Float, default=lambda: time.time())


class ReactionModel(Base):
    __tablename__ = "reactions"

    id = Column(String, primary_key=True, index=True)
    emoji = Column(String, nullable=False)
    fan_name = Column(String, default="Stadium Fan")
    brand_id = Column(String, default="brand-cocacola")
    created_at = Column(Float, default=lambda: time.time())


# ----------------------------------------------------
# USERS / AUTH
# ----------------------------------------------------
class UserModel(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True, index=True)
    password_hash = Column(String, nullable=False)
    company = Column(String, default="")
    role = Column(String, default="Brand")
    avatar = Column(String, default="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80")
    title = Column(String, default="")
    phone = Column(String, default="")
    bio = Column(String, default="")
    company_industry = Column(String, default="")
    company_website = Column(String, default="")
    company_address = Column(String, default="")
    email_alerts = Column(Boolean, default=True)
    push_notifs = Column(Boolean, default=True)
    weekly_report = Column(Boolean, default=False)
    security_alerts = Column(Boolean, default=True)
    favorite_template_ids = Column(JSON, default=list)
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())


# ----------------------------------------------------
# ORGANIZATIONS & EVENTS
# ----------------------------------------------------
class OrganizationModel(Base):
    __tablename__ = "organizations"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    logo = Column(String, default="")
    industry = Column(String, default="Sports")
    description = Column(String, default="")
    website = Column(String, default="")
    contact_email = Column(String, default="")
    member_count = Column(Integer, default=1)
    status = Column(String, default="Active")
    created_at = Column(String, default=lambda: datetime.utcnow().strftime('%Y-%m-%d'))


class EventModel(Base):
    __tablename__ = "events"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, default="Sports")
    venue = Column(String, default="TBD Stadium")
    start_date = Column(String, default="")
    end_date = Column(String, default="")
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=True)
    status = Column(String, default="Draft")
    capacity = Column(Integer, default=5000)
    registered_attendees = Column(Integer, default=0)


# ----------------------------------------------------
# ACTIVITY FEED & NOTIFICATIONS
# ----------------------------------------------------
class ActivityModel(Base):
    __tablename__ = "activities"

    id = Column(String, primary_key=True, index=True)
    type = Column(String, default="general")
    title = Column(String, nullable=False)
    description = Column(String, default="")
    icon_color = Column(String, default="text-indigo-600 bg-indigo-50 border-indigo-200")
    created_at = Column(Float, default=lambda: time.time())


class NotificationModel(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    message = Column(String, default="")
    created_at = Column(Float, default=lambda: time.time())
    is_read = Column(Boolean, default=False)


# ----------------------------------------------------
# ENGAGEMENT LIBRARY TEMPLATES
# ----------------------------------------------------
class TemplateModel(Base):
    __tablename__ = "templates"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    category = Column(String, default="Games")
    description = Column(String, default="")
    thumbnail = Column(String, default="")
    duration = Column(String, default="1-3 mins")
    difficulty = Column(String, default="Easy")
    audience_size = Column(String, default="1 - 10,000")
    popularity = Column(Float, default=5.0)
    rating_count = Column(Integer, default=1)
    tags = Column(JSON, default=list)
    status = Column(String, default="Draft")
    is_featured = Column(Boolean, default=False)
    supported_outputs = Column(JSON, default=list)
    default_brand = Column(String, nullable=True)
    player_journey = Column(JSON, nullable=True)
    created_by_user_id = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())


# ----------------------------------------------------
# GAME CONFIG — Brand-Customisable Tile / Element Store
# ----------------------------------------------------
class GameConfigModel(Base):
    __tablename__ = "game_configs"

    id = Column(String, primary_key=True)        # e.g. "memory-challenge"
    brand_id = Column(String, default="")
    config_json = Column(Text, nullable=True)    # Full JSON config blob
    updated_at = Column(Float, default=lambda: time.time())


# ----------------------------------------------------
# ENGAGEMENT INSTANCE — Immutable UUID snapshot minted on each Brand publish
# ----------------------------------------------------
class InstanceModel(Base):
    __tablename__ = "instances"

    id = Column(String, primary_key=True)         # UUID, minted on publish
    app_id = Column(String, index=True, nullable=False)
    brand_id = Column(String, default="")
    config_json = Column(Text, nullable=True)     # Full JSON config blob, snapshotted at publish
    status = Column(String, default="Published")
    created_at = Column(Float, default=lambda: time.time())
    published_at = Column(Float, default=lambda: time.time())


# ----------------------------------------------------
# METADATA & SEED TRACKING
# ----------------------------------------------------
class MetadataModel(Base):
    __tablename__ = "metadata"

    key = Column(String, primary_key=True)
    value = Column(String, default="")


