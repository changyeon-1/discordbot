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

const RunebestPrices = {
  "룬 ㅣ 투시" : 240,
  "룬 ㅣ 저항" : 296,
  "룬 ㅣ 치유" : 341,
  "룬 ㅣ 호흡" : 357,
  "룬 ㅣ 성급" : 441,
  "룬 ㅣ 반감" : 469,
  "룬 ㅣ 경험" : 2557,
}

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

//룬 포맷 함수
function formatRune(name, before, after, max) {
  if (before === null || after === null) {
    return ` 🧪[[${name}] | 값 변경 없음`;
  }

  if (after === max) {
    return `-🧪[[${name}] | ${before} → ${after}  최고가!!!`;
  } else if (after >= max - 5) {
    return `+🧪[[${name}] | ${before} → ${after}  상한가`;
  } else {
    return ` 🧪[[${name}] | ${before} → ${after}`;
  }
}

// 메뉴 데이터를 날짜별로 정리한 객체입니다.
// 날짜 형식은 "YYYY-MM-DD"를 사용합니다.
const menus = {
  '2025-06-09': {
    "아침": "쌀밥 홍합살미역국 삼치데리야끼구이 토달볶 숙주나물무침 김치",
    "점심": "쌀밥 닭개장 수제탕수육&소스 잡채 골뱅이야채무침 김치",
    "저녁": "쌀밥 바지락된장국 소고기낙지볶음 느타리버섯전 쪽파김가루무침 김치"
  },
  // 예시 데이터 (실제 날짜에 맞게 값을 수정하세요)
  '2025-06-10': {
    "아침": "쌀밥 옹심이만둣국 오색산적 마파두부 브로콜리무침 김치",
    "점심": "쌀밥 부대찌개 꽃닭조림 마늘순대구이&소스 마늘쫑무침 김치",
    "저녁": "쌀밥 소고기뭇국 코다리콩나물찜 모듬소세지볶음 시금치나물무침 김치"
  },
  '2025-06-11': {
    "아침": "쌀밥 얼갈이된장국 돈사태감자조림 호박나물볶음 미역줄기볶음 김치",
    "점심": "쌀밥 어묵곤약국 오삼불고기 쑥갓두부무침 김치",
    "저녁": "쌀밥 건새우계란국 치킨까스샐러드 버터카레 열무나물무침 김치"
  },
  '2025-06-12': {
    "아침": "쌀밥 순두부찌개 고갈비구이 맛살야채볶음 청경채나물무침 김치",
    "점심": "쌀밥 비빕밥/아욱된장국 떡갈비야채조림 계란찜(환아) 단무지무침 콩나물무침(환아) 김치",
    "저녁": "쌀밥 유부장국 오리훈제볶음 볼어묵피망볶음 멸치아몬드볶음 김치"
  },
  '2025-06-13': {
    "아침": "쌀밥 북어채콩나물국 두부스테이크 감자채볶음 참나물무침 김치",
    "점심": "쌀밥 소고기미역국 닭갈비 야끼만두 배추찜 김치",
    "저녁": "쌀밥 팽이버섯된장국 돈육짜장볶음 야채고로케&케찹 도토리묵야채무침 김치"
  },
  '2025-06-14': {
    "아침": "쌀밥 조랭이떡국 갈치무조림 동그랑땡야채조림 얼갈이나물무침 김치",
    "점심": "쌀밥 돈뼈해장국 치즈돈까스 쥬키니파스타 꽃맛살샐러드 김치",
    "저녁": "쌀밥 동태탕 비앤나야채볶음 두부구이 부추나물무침 김치"
  },
  '2025-06-15': {
    "아침": "쌀밥 육개장 너비아니전 애기새송이볶음 자반볶음 김치",
    "점심": "쌀밥 짬뽕수제비 돈육메알장조림 옥수수김치전 치커리겉절이 김치",
    "저녁": "쌀밥 닭곰탕 조기구이 분홍소세지전 숙주나물무침 김치"
  },
};

// 추천 메뉴 리스트 정의
const recommendedMenus = [
  "김치찌개", "된장찌개", "짜장면", "짬뽕", "탕수육", 
  "파스타",  "피자",  "양념치킨",  "족발",  "보쌈",  
  "삼겹살",  "초밥",  "카레",  "돈까스",  "부대찌개",  
  "순대국밥",  "비빔밥",  "냉면",  "칼국수",  "떡볶이",
  "갈비찜", "제육볶음", "소고기미역국", "개사료", "버섯전골",
  "낙지볶음", "육회", "순두부찌개", "찜닭", "후라이드치킨",
  "굶어", "돼지국밥", "뼈해장국", "햄버거", "쟁반짜장",
  "간짜장", "볶음밥", "리조또", "불닭볶음면", "라면",
  "짜파게티", "토스트", "샌드위치", "쫄면", "칼국수",
  "아귀찜", "해물찜", "설렁탕", "참치김밥", "갈비만두",
  "고기만두", "군만두", "사천짜장", "오므라이스", "함박스테이크",
  "막창", "곱창", "대창", "비빔냉면", "물냉면", "꽃등심",
  "콩국수", "계란찜", "계란말이", "장어구이", "곱창전골",
  "라멘", "소바", "우동", "빵", "생선구이", "덴푸라",
  "닭가슴살", "주먹밥", "불고기", "마라탕", "샐러드",
  "샤브샤브", "육개장", "돼지갈비"
  
];


// 상대적 날짜 키워드를 입력받아 대상 날짜 문자열("YYYY-MM-DD")로 변환하는 함수입니다.
function getDateFromRelativeKeyword(keyword) {
  let targetDate = dayjs();
  if (keyword === '내일') {
    targetDate = targetDate.add(1, 'day');
  } else if (keyword === '어제') {
    targetDate = targetDate.subtract(1, 'day');
  } else if (keyword === '모레') { // '모레' 추가
    targetDate = targetDate.add(2, 'day');
  } else if (keyword === '엊그제') { // '엊그제' 추가
    targetDate = targetDate.subtract(2, 'day');
  }

  return targetDate.format('YYYY-MM-DD');
}


//여기서부터 디코 메세지 받기
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith('@요리')) {
    const content = message.content.slice('@요리'.length).trim();

    const regex = /🍳\[(.+?)\] \| \s*(\d*)\s*→\s*(\d+)/g;
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





    if (message.content.startsWith('@연금')) {
      const content = message.content.slice('@연금'.length).trim();

      const regex = /🧪\[(.+?)\] \| \s*(\d*)\s*→\s*(\d+)/g; 
      const items = {};
      let match;

      while ((match = regex.exec(content)) !== null) {
        const [, name, beforeStr, afterStr] = match;
        items[name] = {
          before: parseInt(beforeStr),
          after: parseInt(afterStr),
        };
      }

      const results = []; 

      // 추출된 룬 데이터(items 객체)를 순회하며 각 룬에 대해 처리
      for (const name in items) {
        if (items.hasOwnProperty(name)) { // 객체 자신의 속성인지 확인
          const item = items[name];
          // bestRunePrices에서 해당 룬의 최고 가격을 가져옵니다.
          // 만약 bestRunePrices에 없는 룬이라면 max는 undefined가 됩니다.
          const max = RunebestPrices[name];

          // formatRune 함수를 사용하여 결과를 포맷하고 results 배열에 추가
          results.push(formatRune(name, item.before, item.after, max));
        }
      }


       if (results.length > 0) {
      // 결과를 diff 코드 블록으로 감싸서 응답
        await message.reply(`[연금 분석 결과]\n\`\`\`diff\n${results.join('\n')}\n\`\`\``);
      } else {
        // 추출된 룬 데이터가 없다면 안내 메시지 응답
        await message.reply("⚠️ 분석할 연금 데이터가 없습니다. '🧪[룬 이름] | 이전값 → 현재값' 형식으로 입력해주세요.");
      }
      // 연금 명령어 처리가 완료되었으므로 여기서 return 
      // 다른 명령어와 겹치지 않도록  return
      return;
    }

  


  // 메뉴 추천 명령어 처리
  if (message.content === '메뉴추천') {
    // 추천 메뉴 리스트가 비어있는지 확인
    if (recommendedMenus.length === 0) {
      await message.reply("굶어");
      return; // 리스트가 비어있으면 여기서 함수 종료
    }

    // 리스트에서 무작위 인덱스 선택
    const randomIndex = Math.floor(Math.random() * recommendedMenus.length);

    // 선택된 메뉴 가져오기
    const recommendedMenu = recommendedMenus[randomIndex];

    // 사용자에게 추천 메뉴 응답
    await message.reply(`${recommendedMenu}`);
    return; // 메뉴 추천 처리가 완료되었으므로 다른 명령어 확인을 중단합니다.
  }







      // 명령어 패턴: "오늘 아침?", "내일 점심?" 또는 "어제 저녁?"과 같은 형식이어야 합니다.
    // 정규표현식을 사용하여 상대 날짜와 식사 시간을 추출합니다.
    const commandRegex = /^(오늘|내일|어제|엊그제|모레)\s*(아침|점심|저녁)\?$/;
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

        const dayOfWeek = dayjs(targetDate).format('dddd');

        message.reply(`${targetDate} (${dayOfWeek}) ${mealTime} 메뉴: ${menuItem}`);
    } else {
        message.reply(`해당 날짜(${targetDate})의 ${mealTime} 메뉴가 없습니다.`);
    }


  

});

client.login(token);
