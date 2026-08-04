from typing import Optional, List, Any
from pydantic import BaseModel, Field

# ----------------------------------------------------
# SELFIE SCHEMAS
# ----------------------------------------------------
class SelfieCreate(BaseModel):
    uploaderName: Optional[str] = "Stadium Fan"
    photoUrl: str
    caption: Optional[str] = "Live from FanZone!"
    brandId: Optional[str] = "brand-cocacola"

class SelfieResponse(BaseModel):
    id: str
    uploaderName: str
    photoUrl: str
    caption: str
    status: str
    aiSafetyScore: int
    aiRiskLevel: str
    aiFlags: List[str] = []
    isFeatured: bool
    brandId: str
    approvedAt: Optional[float] = None
    createdAt: float

    class Config:
        from_attributes = True

class BulkActionRequest(BaseModel):
    ids: List[str]

# ----------------------------------------------------
# IDLE SCREEN SCHEMAS
# ----------------------------------------------------
class SponsorLogoItem(BaseModel):
    id: str
    name: str
    logo: str

class IdleConfigUpdate(BaseModel):
    eventTitle: Optional[str] = None
    subtitle: Optional[str] = None
    eventLogo: Optional[str] = None
    messageTitle: Optional[str] = None
    sponsorLogos: Optional[List[SponsorLogoItem]] = None

class IdleConfigResponse(BaseModel):
    eventTitle: str
    subtitle: str
    eventLogo: str
    messageTitle: str
    sponsorLogos: List[Any] = []

    class Config:
        from_attributes = True

# ----------------------------------------------------
# BRAND KIT SCHEMAS
# ----------------------------------------------------
class BrandKitSchema(BaseModel):
    id: str
    name: str
    logo: str
    primaryColor: Optional[str] = "#E60000"
    secondaryColor: Optional[str] = "#000000"
    accentColor: Optional[str] = "#FFD700"
    bgGradient: Optional[str] = "from-red-950 via-slate-950 to-black"

    class Config:
        from_attributes = True

# ----------------------------------------------------
# SCREEN LAUNCH SCHEMAS
# ----------------------------------------------------
class ScreenStatusUpdate(BaseModel):
    isSelfieWallActive: Optional[bool] = False
    activeMode: Optional[str] = "idle"
    idleConfig: Optional[dict] = None


# ----------------------------------------------------
# USER / AUTH SCHEMAS
# ----------------------------------------------------
class RegisterRequest(BaseModel):
    fullName: str
    companyName: Optional[str] = ""
    email: str
    password: str
    role: Optional[str] = "Brand"

class LoginRequest(BaseModel):
    email: str
    password: str

class ChangePasswordRequest(BaseModel):
    currentPassword: str
    newPassword: str

class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    title: Optional[str] = None
    bio: Optional[str] = None
    company: Optional[str] = None
    companyIndustry: Optional[str] = None
    companyWebsite: Optional[str] = None
    companyAddress: Optional[str] = None
    avatar: Optional[str] = None
    role: Optional[str] = None
    emailAlerts: Optional[bool] = None
    pushNotifs: Optional[bool] = None
    weeklyReport: Optional[bool] = None
    securityAlerts: Optional[bool] = None
    favoriteTemplateIds: Optional[List[str]] = None

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    company: str
    role: str
    avatar: str
    title: str
    phone: str
    bio: str
    companyIndustry: str
    companyWebsite: str
    companyAddress: str
    emailAlerts: bool
    pushNotifs: bool
    weeklyReport: bool
    securityAlerts: bool
    favoriteTemplateIds: List[str] = []
    createdAt: str

    class Config:
        from_attributes = True


# ----------------------------------------------------
# ORGANIZATION SCHEMAS
# ----------------------------------------------------
class OrganizationCreate(BaseModel):
    name: str
    logo: Optional[str] = ""
    industry: Optional[str] = "Sports"
    description: Optional[str] = ""
    website: Optional[str] = ""
    contactEmail: Optional[str] = ""

class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    logo: Optional[str] = None
    industry: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    contactEmail: Optional[str] = None
    status: Optional[str] = None

class OrganizationResponse(BaseModel):
    id: str
    name: str
    logo: str
    industry: str
    description: str
    website: str
    contactEmail: str
    memberCount: int
    eventCount: int
    status: str
    createdAt: str

    class Config:
        from_attributes = True


# ----------------------------------------------------
# EVENT SCHEMAS
# ----------------------------------------------------
class EventCreate(BaseModel):
    name: str
    type: Optional[str] = "Sports"
    venue: Optional[str] = "TBD Stadium"
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    organizationId: Optional[str] = None
    status: Optional[str] = "Draft"
    capacity: Optional[int] = 5000

class EventUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    venue: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    organizationId: Optional[str] = None
    status: Optional[str] = None
    capacity: Optional[int] = None
    registeredAttendees: Optional[int] = None

class EventResponse(BaseModel):
    id: str
    name: str
    type: str
    venue: str
    startDate: str
    endDate: str
    organizationId: Optional[str] = None
    organizer: str
    status: str
    capacity: int
    registeredAttendees: int

    class Config:
        from_attributes = True


# ----------------------------------------------------
# ACTIVITY & NOTIFICATION SCHEMAS
# ----------------------------------------------------
class ActivityResponse(BaseModel):
    id: str
    type: str
    title: str
    description: str
    iconColor: str
    createdAt: float

    class Config:
        from_attributes = True

class NotificationResponse(BaseModel):
    id: str
    title: str
    message: str
    createdAt: float
    isRead: bool

    class Config:
        from_attributes = True


# ----------------------------------------------------
# TEMPLATE SCHEMAS
# ----------------------------------------------------
class TemplateCreate(BaseModel):
    title: str
    category: Optional[str] = "Games"
    description: Optional[str] = ""
    thumbnail: Optional[str] = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80"
    tags: Optional[List[str]] = None
    duration: Optional[str] = "1-3 mins"
    difficulty: Optional[str] = "Easy"
    status: Optional[str] = "Draft"
    createdByUserId: Optional[str] = None

class TemplateResponse(BaseModel):
    id: str
    title: str
    category: str
    description: str
    thumbnail: str
    duration: str
    difficulty: str
    audienceSize: str
    popularity: float
    ratingCount: int
    tags: List[str] = []
    status: str
    isFeatured: bool
    supportedOutputs: List[str] = []
    defaultBrand: Optional[str] = None
    playerJourney: Optional[List[str]] = None
    createdByUserId: Optional[str] = None
    createdAt: str

    class Config:
        from_attributes = True


# ----------------------------------------------------
# BRAND KIT CREATE/UPDATE (extends BrandKitSchema above)
# ----------------------------------------------------
class BrandKitCreate(BaseModel):
    name: str
    logo: str
    primaryColor: Optional[str] = "#E60000"
    secondaryColor: Optional[str] = "#000000"
    accentColor: Optional[str] = "#FFD700"
    bgGradient: Optional[str] = "from-red-950 via-slate-950 to-black"
    logoText: Optional[str] = ""
    bgColor: Optional[str] = "#000000"
    cardBg: Optional[str] = "#111111"
    textColor: Optional[str] = "#FFFFFF"
    fontFamily: Optional[str] = "Inter, sans-serif"
    buttonRadius: Optional[str] = "16px"
    buttonClass: Optional[str] = ""
    collectibleName: Optional[str] = ""
    collectibleIcon: Optional[str] = ""
    collectiblePoints: Optional[str] = "+100 pts"
    obstacleName: Optional[str] = ""
    obstacleIcon: Optional[str] = ""
    powerUpName: Optional[str] = ""
    powerUpIcon: Optional[str] = ""
    runnerSprite: Optional[str] = ""
    tagline: Optional[str] = ""
    themeBadge: Optional[str] = ""
    audioTheme: Optional[str] = ""

class BrandKitUpdate(BaseModel):
    name: Optional[str] = None
    logo: Optional[str] = None
    primaryColor: Optional[str] = None
    secondaryColor: Optional[str] = None
    accentColor: Optional[str] = None
    bgGradient: Optional[str] = None
    logoText: Optional[str] = None
    bgColor: Optional[str] = None
    cardBg: Optional[str] = None
    textColor: Optional[str] = None
    fontFamily: Optional[str] = None
    buttonRadius: Optional[str] = None
    buttonClass: Optional[str] = None
    collectibleName: Optional[str] = None
    collectibleIcon: Optional[str] = None
    collectiblePoints: Optional[str] = None
    obstacleName: Optional[str] = None
    obstacleIcon: Optional[str] = None
    powerUpName: Optional[str] = None
    powerUpIcon: Optional[str] = None
    runnerSprite: Optional[str] = None
    tagline: Optional[str] = None
    themeBadge: Optional[str] = None
    audioTheme: Optional[str] = None

class BrandKitResponse(BaseModel):
    id: str
    name: str
    logo: str
    primaryColor: str
    secondaryColor: str
    accentColor: str
    bgGradient: str
    gradientBg: str
    logoText: str
    bgColor: str
    cardBg: str
    textColor: str
    fontFamily: str
    buttonRadius: str
    buttonClass: str
    collectibleName: str
    collectibleIcon: str
    collectiblePoints: str
    obstacleName: str
    obstacleIcon: str
    powerUpName: str
    powerUpIcon: str
    runnerSprite: str
    tagline: str
    themeBadge: str
    audioTheme: str


# ----------------------------------------------------
# LIVE POLL SCHEMAS
# ----------------------------------------------------
class PollOptionSchema(BaseModel):
    id: str
    text: str
    votes: int = 0
    color: Optional[str] = "indigo"

class PollCreateSchema(BaseModel):
    question: str
    category: Optional[str] = "Match Day Halftime Poll"
    options: List[dict] # List of option objects
    brandId: Optional[str] = "brand-cocacola"

class PollResponseSchema(BaseModel):
    id: str
    question: str
    category: str
    options: List[dict]
    totalVotes: int
    isActive: bool
    brandId: str
    createdAt: float

    class Config:
        from_attributes = True

class VoteCreateSchema(BaseModel):
    pollId: str
    optionId: str

class ScreenStateResponse(BaseModel):
    id: str
    isSelfieWallActive: bool
    activeBrandId: str
    activeMode: str
    activePollId: str


# ----------------------------------------------------
# REACTION WALL SCHEMAS
# ----------------------------------------------------
class ReactionEmitSchema(BaseModel):
    emoji: str
    fanName: Optional[str] = "Stadium Fan"
    brandId: Optional[str] = "brand-cocacola"

class ReactionResponseSchema(BaseModel):
    id: str
    emoji: str
    fanName: str
    brandId: str
    createdAt: float

    class Config:
        from_attributes = True


