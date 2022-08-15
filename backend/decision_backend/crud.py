from sqlalchemy.orm import Session
from decision_backend import schemas
from decision_backend.db import DecisionModel


def get_decision_models(db: Session, skip: int = 0, limit: int = 100):
    return db.query(DecisionModel).offset(skip).limit(limit).all()


def create_user_decision_model(
        db: Session,
        decision_model: schemas.DecisionModelCreate,
        user_id: int
):
    db_decision_model = db.DecisionModel(
        **decision_model.dict(), owner_id=user_id)
    db.add(db_decision_model)
    db.commit()
    db.refresh(db_decision_model)
    return db_decision_model
