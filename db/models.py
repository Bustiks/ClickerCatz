from sqlalchemy import Table, Column, Integer, String, MetaData, BigInteger
from sqlalchemy.orm import Mapped, mapped_column


metadata_obj = MetaData()



users = Table(
    "users",
    metadata_obj,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("tg_id", BigInteger),
    Column("coins", Integer, default=0),
    Column("energy", Integer, default=1500),
    Column("lvl", Integer, default=1),
    Column('progress', Integer, default=0),
    Column('coinsPerClick', Integer, default=1),
    Column('currentRank', String(228), default="Catzen"),
    Column('currentLevel', Integer, default=1),
    Column('maxEnergy', Integer, default=1500),
    Column('bonus', Integer, default=0)
\
)

referrals = Table(
    "referrals",
    metadata_obj,
    Column("referral_id", BigInteger),
    Column("referrer_id", BigInteger)
)








