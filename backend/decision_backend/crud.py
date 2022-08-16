from sqlalchemy.orm import Session
from sqlalchemy.future import select
from decision_backend import schemas
from decision_backend.db import DecisionModel


async def get_decision_models(db: Session, skip: int = 0, limit: int = 100):
    q = select(DecisionModel).offset(skip).limit(limit)
    result = await db.execute(q)
    return result.scalars().all()


async def get_user_decision_models(db: Session, user: schemas.UserRead):
    q = select(DecisionModel).where(DecisionModel.owner_id == user.id)
    result = await db.execute(q)
    return result.scalars().all()


async def create_user_decision_model(
        db: Session,
        decision_model: schemas.DecisionModelCreate,
        user: schemas.UserRead):
    db_decision_model = DecisionModel(
        **decision_model.dict(), owner_id=user.id)
    db.add(db_decision_model)
    await db.flush()
    await db.commit()
    return db_decision_model
