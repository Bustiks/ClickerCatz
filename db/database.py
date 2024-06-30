import aiomysql
from .config import settings

class Database:
    def __init__(self):
        self.pool = None

    async def connect(self):
        self.pool = await aiomysql.create_pool(
            **settings.DATABASE_URL_async,
            minsize=1,
            maxsize=10
        )

    async def close(self):
        if self.pool:
            self.pool.close()
            await self.pool.wait_closed()

    async def execute(self, query, *args):
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(query, args)
                await conn.commit()

    async def fetchone(self, query, *args):
        async with self.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute(query, args)
                result = await cur.fetchone()
                return result

    async def fetchall(self, query, *args):
        async with self.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute(query, args)
                result = await cur.fetchall()
                return result

db = Database()

async def giveBonus(user_id):
    await db.execute("UPDATE users SET coins = coins + 25000, bonus = 1 WHERE tg_id = %s", user_id)

async def checkUserBonus(user_id):
    user_bonus = await db.fetchone("SELECT bonus FROM users WHERE tg_id = %s", user_id)
    if user_bonus:
        return {"bonus": user_bonus["bonus"]}
    return {"bonus": None}

async def get_referrals(user_id):
    referrals = await db.fetchall("SELECT * FROM referrals WHERE referrer_id = %s", user_id)
    return len(referrals)

async def get_user_info(user_id):
    user_data = await db.fetchone("SELECT * FROM users WHERE tg_id = %s", user_id)
    if user_data:
        user_info = {
            "coins": user_data["coins"],
            "energy": user_data["energy"],
            "lvl": user_data["lvl"],
            "progress": user_data["progress"],
            "coinsPerClick": user_data["coinsPerClick"],
            "currentRank": user_data["currentRank"],
            "currentLevel": user_data["currentLevel"],
            "maxEnergy": user_data["maxEnergy"]
        }
        return user_info

async def update_user_info(user_id, coins, energy, progress, coinsPerClick, currentRank, currentLevel, maxEnergy):
    await db.execute(
        "UPDATE users SET coins = %s, energy = %s, progress = %s, coinsPerClick = %s, currentRank = %s, currentLevel = %s, maxEnergy = %s WHERE tg_id = %s",
        coins, energy, progress, coinsPerClick, currentRank, currentLevel, maxEnergy, user_id
    )

async def replace_user_energy(user_id, maxEnergy):
    await db.execute("UPDATE users SET energy = %s WHERE tg_id = %s", maxEnergy, user_id)

async def update_coins(user_id):
    await db.execute("UPDATE users SET coins = 0 WHERE tg_id = %s", user_id)