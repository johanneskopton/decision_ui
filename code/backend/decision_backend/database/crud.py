"""CRUD operations on database for storing and retrieving models and users."""

from sqlalchemy.orm import Session
from sqlalchemy.future import select
from decision_backend.rest import schema
from decision_backend.database.schema import DecisionModel


async def get_user_decision_models(db: Session, user: schema.UserRead):
    """Return a user from the database."""
    q = select(DecisionModel).where(DecisionModel.owner_id == user.id)
    result = await db.execute(q)
    return result.scalars().all()


async def delete_decision_model(db: Session, user: schema.UserRead, decision_model_id: int):
    """Delete a model from the database."""
    q = select(DecisionModel).where(DecisionModel.owner_id == user.id).where(DecisionModel.id == decision_model_id)
    row = await db.execute(q)
    row = row.scalar_one()
    await db.delete(row)
    await db.commit()
    return


async def create_user_decision_model(db: Session, decision_model: schema.DecisionModelCreate, user: schema.UserRead):
    """Store a model in the database."""
    q = (
        select(DecisionModel)
        .where(DecisionModel.owner_id == user.id)
        .where(DecisionModel.name == decision_model.name)
        .limit(1)
    )
    result = await db.execute(q)
    result_list = result.scalars().all()
    if len(result_list) == 1:
        # found one model already stored in the database, overwrite it
        result_list[0].content = decision_model.content
        await db.flush()
        await db.commit()
        return result_list[0]
    else:
        # add a new model with a not yet known name
        db_decision_model = DecisionModel(**decision_model.model_dump(), owner_id=user.id)
        db.add(db_decision_model)
        await db.flush()
        await db.commit()
        return db_decision_model
