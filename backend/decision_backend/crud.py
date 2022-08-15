from sqlalchemy.orm import Session
from decision_backend import schemas
from decision_backend.db import DecisionModel
from uuid import UUID


def get_decision_models(db: Session, skip: int = 0, limit: int = 100):
    return db.query(DecisionModel).offset(skip).limit(limit).all()


async def create_user_decision_model(
        db: Session,
        decision_model: schemas.DecisionModelCreate,
        user_id: UUID
):
    db_decision_model = DecisionModel(
        **decision_model.dict(), owner_id=user_id)
    db.add(db_decision_model)
    await db.flush()
    return db_decision_model
