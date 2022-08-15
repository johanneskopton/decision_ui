from sqlalchemy.orm import Session
from decision_backend import db_models, schemas


def get_decision_models(db: Session, skip: int = 0, limit: int = 100):
    return db.query(db_models.DecisionModel).offset(skip).limit(limit).all()


def create_user_decision_model(
        db: Session,
        decision_model: schemas.DecisionModelCreate,
        user_id: int
):
    db_decision_model = db_models.DecisionModel(
        **decision_model.dict(), owner_id=user_id)
    db.add(db_decision_model)
    db.commit()
    db.refresh(db_decision_model)
    return db_decision_model
