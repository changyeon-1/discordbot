const { Client, Events, GatewayIntentBits } = require('discord.js');
const dayjs = require('dayjs'); // 날짜 계산을 위해 dayjs 사용
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
require('dotenv').config();
require('dayjs/locale/ko');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping
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
  "룬 ㅣ 투시": 240,
  "룬 ㅣ 저항": 296,
  "룬 ㅣ 치유": 341,
  "룬 ㅣ 호흡": 357,
  "룬 ㅣ 성급": 441,
  "룬 ㅣ 반감": 469,
  "룬 ㅣ 경험": 2557,
}

// 포맷 함수
function formatItem(name, before, after, max) {
  if (before === null || after === null) {
    return ` 🍳[${name}] | 값 변경 없음`;
  }

  if (after === max) {
    return `-🍳[${name}] | ${before} → ${after}  최고가!!!`;
  } else if (after >= max - 2) {
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

  '2025-06-30': {
    "아침": "북어채뭇국 너비아니계란전 애기새송이버섯볶음 시금치나물무침",
    "점심": "소고기미역국 꽃닭볶음 오꼬노미야끼 치커리토마토무침",
    "저녁": "콩나물국 소보로버터장조림 야채고로케*케찹 도토리묵야채무침"
  },
  // 예시 데이터 (실제 날짜에 맞게 값을 수정하세요)
  '2025-07-01': {
    "아침": "유부장국 코다리콩나물찜 스크램블에그 열무된장나물",
    "점심": "얼갈이된장국 돈육야채볶음 갈비만두찜&간장 꽃맛살샐러드",
    "저녁": "육개장 모듬소세지야채볶음 두부야채조림 마늘쫑표고버섯볶음"
  },
  '2025-07-02': {
    "아침": "시래기된장국 소고기낙지볶음 새우살브로콜리볶음 고사리들깨나물",
    "점심": "닭곰탕 임꺽정떡갈비&파채 파스타샐러드 추부추무침/부추니",
    "저녁": "두부김칫국 조기구이 동그랑땡전&케찹 맛살숙주무침"
  },
  '2025-07-03': {
    "아침": "대구탕 미트볼파인애플조림 호박나물볶음 연근흑임자무침",
    "점심": "어묵곤약국 치즈닭갈비 참치깻잎전 배추찜",
    "저녁": "순두부찌개 돈육청경채볶음 잡채 쑥갓두부무침"
  },
  '2025-07-04': {
    "아침": "물만둣국 고등어무조림 메추리알장조림 콩나물무침",
    "점심": "부대찌개 새우까스&타르소스 떡볶이 미역줄기볶음",
    "저녁": "아욱된장국 오색산적 단호박카레소스 마카로니샐러드"
  },
  '2025-07-05': {
    "아침": "건새우계란국 돈사태김치조림 감자채볶음 참나물무침",
    "점심": "소고기떡국 오리훈제야채볶음 분홍소세지전 간장깻잎지",
    "저녁": "들깨수제빗국 갈치무조림 비엔나떡볶음 얼갈이된장나물"

  },
  '2025-07-06': {
    "아침": "순두부된장국 닭살카레볶음 느타리버섯볶음 브로콜리두부무침",
    "점심": "돈뼈해장국 탕수육&소스 해물우동볶음 청경채무침/나물",
    "저녁": "건새우미역국 가자미유린기 계란찜 가지나물볶음"

  },
};

// 플러그인을 dayjs에 등록합니다
dayjs.extend(utc);
dayjs.extend(timezone);

// 기본 타임존을 한국 시간(Asia/Seoul)으로 설정합니다
dayjs.tz.setDefault('Asia/Seoul');
dayjs.locale('ko');

// 추천 메뉴 리스트 정의
const recommendedMenus = [
  "김치찌개", "된장찌개", "짜장면", "짬뽕", "탕수육",
  "파스타", "피자", "양념치킨", "족발", "보쌈",
  "삼겹살", "초밥", "카레", "돈까스", "부대찌개",
  "순대국밥", "비빔밥", "냉면", "칼국수", "떡볶이",
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
  let targetDate = dayjs().tz('Asia/Seoul');
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




  // **오늘 급식 명령어 처리 (새로 추가)**
  if (message.content === '오늘 급식') {
    // 출력할 특정 링크를 여기에 입력하세요.
    const specificLink = "https://earify.github.io/ysg/bab.html"; // 예: "https://school.meal.go.kr/today"

    // 사용자에게 링크 응답
    await message.reply(`${specificLink}`);
    return; // 오늘 급식 처리가 완료되었으므로 여기서 함수 종료
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
