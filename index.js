const { Client, Events, GatewayIntentBits } = require('discord.js');
const dayjs = require('dayjs'); // 날짜 계산을 위해 dayjs 사용
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const token = process.env.TOKEN;


client.once(Events.ClientReady, readyClient => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// 수동 최고가 설정
const bestPrices = {
  "브리또": 80, "블루베리 치즈케이크": 80, "과일 케이크": 89, "퐁신 오믈렛": 89, "로스트 치킨": 89,
  "소고기미역국": 74, "마늘빵": 85, "고구마 팬케이크": 89, "무트볼": 51, "라면": 85, "타코": 51,
  "샌드위치": 142, "고구마 맛탕": 51, "감자튀김": 80, "전복죽": 97, "스테이크": 80,
  "와플": 85, "홍합파스타": 149, "핫도그": 142, "베이글": 51, "해물카레": 34, "콘 마카로니": 85, "고로케": 22
};

const priorityOrder = {
  '1차': ['무트볼', '베이글', '타코', '고구마 맛탕', '해물카레', '고로케'],
  '2차': ['라면', '콘 마카로니', '감자튀김', '브리또', '소고기미역국'],
  '3차': ['와플', '마늘빵', '블루베리 치즈케이크', '스테이크', '전복죽'],
  '4차': ['샌드위치', '핫도그', '과일 케이크', '퐁신 오믈렛', '로스트 치킨', '고구마 팬케이크', '홍합파스타'],
};

// 포맷 함수
function formatItem(name, before, after, max) {
  if (before === null || after === null) {
    return ` 🍳[${name}] | 값 변경 없음`;
  }

  if (after === max) {
    return `-🍳[${name}] | ${before} → ${after}  최고가!!!`;
  } else if (after >= max - 3) {
    return `+🍳[${name}] | ${before} → ${after}  상한가`;
  } else {
    return ` 🍳[${name}] | ${before} → ${after}`;
  }
}

// 메뉴 데이터를 날짜별로 정리한 객체입니다.
// 날짜 형식은 "YYYY-MM-DD"를 사용합니다.
const menus = {
  // 예시 데이터 (실제 날짜에 맞게 값을 수정하세요)
  [dayjs().format('2025-06-10')]: {
    "아침": "토스트와 달걀",
    "점심": "김밥",
    "저녁": "비빔밥"
  },
  [dayjs().add(1, 'day').format('2025-06-11')]: {
    "아침": "시리얼과 우유",
    "점심": "라면",
    "저녁": "스테이크"
  },
  [dayjs().subtract(1, 'day').format('2025-06-12')]: {
    "아침": "팬케이크",
    "점심": "샌드위치",
    "저녁": "파스타"
  }
};

// 상대적 날짜 키워드를 입력받아 대상 날짜 문자열("YYYY-MM-DD")로 변환하는 함수입니다.
function getDateFromRelativeKeyword(keyword) {
  let targetDate = dayjs();
  if (keyword === '내일') {
    targetDate = targetDate.add(1, 'day');
  } else if (keyword === '어제') {
    targetDate = targetDate.subtract(1, 'day');
  }
  return targetDate.format('YYYY-MM-DD');
}


//여기서부터 디코 메세지 받기
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith('@요리')) {
    const content = message.content.slice('@요리'.length).trim();

    const regex = /🍳\[(.+?)\] \| (\d+) → (\d+)/g;
    const items = {};
    let match;

    while ((match = regex.exec(content)) !== null) {
      const [, name, beforeStr, afterStr] = match;
      items[name] = {
        before: parseInt(beforeStr),
        after: parseInt(afterStr),
      };
    }

    const sections = [];

    for (const [label, group] of Object.entries(priorityOrder)) {
      const results = [];

      for (const name of group) {
        const item = items[name];
        const max = bestPrices[name];

        if (item) {
          results.push(formatItem(name, item.before, item.after, max));
        } else {
          results.push(formatItem(name, null, null, max));
        }
      }

      if (results.length > 0) {
        sections.push(`[${label}]\n\`\`\`diff\n${results.join('\n')}\n\`\`\``);
      }
    }

    if (sections.length > 0) {
      await message.reply(sections.join('\n'));
    } else {
      await message.reply("⚠️ 분석할 요리 데이터가 없습니다.");
    }
  }





      // 명령어 패턴: "오늘 아침?", "내일 점심?" 또는 "어제 저녁?"과 같은 형식이어야 합니다.
    // 정규표현식을 사용하여 상대 날짜와 식사 시간을 추출합니다.
    const commandRegex = /^(오늘|내일|어제)\s*(아침|점심|저녁)\?$/;
    const match = message.content.match(commandRegex);
    
    if (!match) return; // 명령어 형식과 일치하지 않으면 무시

    // 정규표현식에서 추출한 상대 날짜와 식사 시간입니다.
    const relativeDate = match[1];
    const mealTime = match[2];

    // 입력받은 상대 날짜 키워드를 이용하여 정확한 날짜 문자열을 얻습니다.
    const targetDate = getDateFromRelativeKeyword(relativeDate);

    // 메뉴 데이터에서 해당 날짜와 식사 시간에 해당하는 메뉴를 검색합니다.
    if (menus[targetDate] && menus[targetDate][mealTime]) {
        const menuItem = menus[targetDate][mealTime];
        message.reply(`${targetDate} ${mealTime} 메뉴: ${menuItem}`);
    } else {
        message.reply(`해당 날짜(${targetDate})의 ${mealTime} 메뉴가 없습니다.`);
    }
});

client.login(token);
