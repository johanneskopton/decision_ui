from sqlalchemy.orm import Session
from sqlalchemy.future import select
from decision_backend.rest import schema
from decision_backend.database.schema import DecisionModel


async def get_user_decision_models(db: Session, user: schema.UserRead):
    q = select(DecisionModel).where(DecisionModel.owner_id == user.id)
    result = await db.execute(q)
    return result.scalars().all()


async def delete_decision_model(db: Session, user: schema.UserRead, decision_model_id: int):
    q = select(DecisionModel).where(DecisionModel.owner_id == user.id).where(DecisionModel.id == decision_model_id)
    row = await db.execute(q)
    row = row.scalar_one()
    await db.delete(row)
    await db.commit()
    return


async def create_user_decision_model(db: Session, decision_model: schema.DecisionModelCreate, user: schema.UserRead):
    q = select(DecisionModel).where(DecisionModel.owner_id == user.id).where(DecisionModel.name == decision_model.name)
    result = await db.execute(q)
    result_list = result.scalars().all()
    if not len(result_list):
        db_decision_model = DecisionModel(**decision_model.dict(), owner_id=user.id)
        db.add(db_decision_model)
        await db.flush()
        await db.commit()
        return db_decision_model
    else:
        result_list[0].content = decision_model.content
        await db.flush()
        await db.commit()
        return result_list[0]
