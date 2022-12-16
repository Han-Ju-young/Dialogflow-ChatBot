// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const admin = require('firebase-admin');
const https = require('https');

const request = require('request');
const convert = require('xml-js');


exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  
  function askAgain(agent) {
    agent.setFollowupEvent({
      "name": "evt-ask-again"
    });
    agent.add('');
  }
  function goodBye(agent) {
    agent.setFollowupEvent({
      "name": "evt-good-bye"
    });
    agent.add('');
  }

  function getWeather(agent) {
    return weatherAPI()
        .then(result => agent.add(result))
        .catch((err) => agent.add(err));
  }
  function weatherAPI() {
    const url = "https://api.openweathermap.org/data/2.5/weather?q=Seoul&units=metric&appid=bcb7ef53c1041f25446ebdf9e38caaef"

      return new Promise((resolve, reject) => {
          https.get(url, function (res) {
              var json = "";
              res.on("data", function (chunk) {
                  json += chunk;
              });
              res.on("end", function () {
                  let jsonData = JSON.parse(json);
                  let r = "현재 서울 날씨는 ";
                  switch(jsonData.weather[0].main) {
                    case "Clear" :
                      r += "맑음 입니다.\n";
                      break;
                    case "few clouds" :
                      r += "구름 조금 입니다.\n";
                      break;
                    case "Clouds" :
                      r += "흐림 입니다.\n";
                      break;
                    case "Snow" :
                      r += "눈 입니다.\n";
                      break;
                    case "Rain" :
                      r += "비 입니다.\n";
                      break;
                  }
                  r += "온도는 " + jsonData.main.temp + "°C, 체감온도는 " + jsonData.main.feels_like + "°C, 습도는 " + jsonData.main.humidity + "% 이며, 풍속은 " + jsonData.wind.speed + "m/s 입니다.\n";
                  r += "\n[다른 질문이 있으신가요?]";
                  resolve(r);
              });
          });
      });
    }
    function getshipinandoutAPI(agent) {
      return shipinandoutAPI()
          .then(result => agent.add(result))
          .catch((err) => agent.add(err));
    }
    function shipinandoutAPI() {
      const url = 'http://apis.data.go.kr/1192000/VsslEtrynd2/Info'
      url += '?' + encodeURIComponent('serviceKey') + '=RvS9jmxLAJECGdTDRKoNhuWC2Im4mKQ18jr6Acvbe%2B4VX%2FgKPf4Rs4dxRgBjpA5uq9JSCUPg%2B6CJEUcIV8PzaA%3D%3D';
      url += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); 
      url += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('10'); 
      url += '&' + encodeURIComponent('prtAgCd') + '=' + encodeURIComponent('020'); 
      url += '&' + encodeURIComponent('sde') + '=' + encodeURIComponent('20170209');
      url += '&' + encodeURIComponent('ede') + '=' + encodeURIComponent('20170209'); 
      url += '&' + encodeURIComponent('clsgn') + '=' + encodeURIComponent('9VHZ8'); 

      return new Promise((resolve, reject) => { 
        request({
          url: url + queryParams,
          method: 'GET'
        }, function (error, response, body) {
          var json = convert.xml2json(body, {compact: true, spaces: 4});
          var data = JSON.parse(json).response.body.items.item;
          var prtAgCd = data['prtAgCd']._text;
          var prtAgNm = data['prtAgNm']._text;
          var etryptYear = data['etryptYear']._text;
          var etryptCo = data['etryptCo']._text;
          var clsgn = data['clsgn']._text;
          var vsslNm = data['vsslNm']._text;
          var vsslNltyNm = data['vsslNltyNm']._text;
          var vsslKndNm = data['vsslKndNm']._text;
          var etryptPurpsCd = data['etryptPurpsCd']._text;
          var etryptPurpsNm = data['etryptPurpsNm']._text;
          var prvsDpmprtPrtNm = data['prvsDpmprtPrtNm']._text;

          let r = "항구청코드: " + prtAgCd + "\n항구청명: " + prtAgNm + "\n입항년도: " + etryptYear + "\n입항횟수: " + etryptCo
          r += "\n호출부호: " + clsgn + "\n선박명: " + vsslNm + "\n선박국가명: " + vsslNltyNm;
          r += "\n입항목적코드: " + etryptPurpsCd + "\n입항목적명: " + etryptPurpsNm + "\n목적지항구명: " + prvsDpmprtPrtNm;
          resolve(r);
        });
      });
    }
  
  function shiinout(agent) {
    agent.add(`조회된 결과는 아래와 같습니다.
    항구청코드: 020   항구청명: 부산   입항년도: 2017   입항횟수: 003   호출부호: 9VHZ8   
    선박명: WAN HAI 261   선박국가명: 싱가포르   선박종류명: 풀컨테이너선
    입항목적코드: 01   입항목적명: 양적하   목적지항구명: 울산
    
    입항일시 : 2017-02-09T17:00:00+09:00
    출항일시 : 2017-02-10T01:58:00+09:00
    내외항구분명 : 외항 
    계선시설코드 : MBR   
    계선 시설명 : 신감만부두 2 선석
    총톤수 : 18872   
    신고업체명 : 만해항운한국 (주)
    
    [다른 질문이 있으신가요?]`);
  }

  
  function ship1(agent) {
    agent.add(`조회된 결과는 아래와 같습니다.
[ 통계 분류 코드 : 1   통계 분류 코드명 : 여객선 ]

선박 종류(용도) 코드 : 11   선박 종류(용도) 코드명 : 여객선
선박 종류(용도) 코드 : 12   선박 종류(용도) 코드명 : 화객선
선박 종류(용도) 코드 : 13   선박 종류(용도) 코드명 : 국제카훼리
선박 종류(용도) 코드 : 14   선박 종류(용도) 코드명 : 크루즈선

[다른 질문이 있으신가요?]`);
  }
  
  function ship2(agent) {
    agent.add(`조회된 결과는 아래와 같습니다.
[ 통계 분류 코드 : 02   통계 분류 코드명 : 산물선 ]

선박 종류(용도) 코드 : 21   선박 종류(용도) 코드명 : 산물선(벌크선)
선박 종류(용도) 코드 : 22   선박 종류(용도) 코드명 : 양곡운반선
선박 종류(용도) 코드 : 24   선박 종류(용도) 코드명 : 광석운반선
선박 종류(용도) 코드 : 25   선박 종류(용도) 코드명 : 석탄운반선
선박 종류(용도) 코드 : 29   선박 종류(용도) 코드명 : 철강재운반선
선박 종류(용도) 코드 : 30   선박 종류(용도) 코드명 : 코일전용선
선박 종류(용도) 코드 : 31   선박 종류(용도) 코드명 : 모래운반선
선박 종류(용도) 코드 : 33   선박 종류(용도) 코드명 : 폐기물운반선

[다른 질문이 있으신가요?]`);
  }
  
  function ship3(agent) {
    agent.add(`조회된 결과는 아래와 같습니다.
[ 통계 분류 코드 : 03   통계 분류 코드명 : 원목선 ]

선박 종류(용도) 코드 : 23   선박 종류(용도) 코드명 : 원목운반선

[다른 질문이 있으신가요?]`);
  }
  
  function ship4(agent) {
    agent.add(`조회된 결과는 아래와 같습니다.
[ 통계 분류 코드 : 04   통계 분류 코드명 : 시멘트선 ]

선박 종류(용도) 코드 : 26   선박 종류(용도) 코드명 : 시멘트운반선

[다른 질문이 있으신가요?]`);
  }
  
  function ship5(agent) {
    agent.add(`조회된 결과는 아래와 같습니다.
[ 통계 분류 코드 : 05   통계 분류 코드명 : 자동차선 ]

선박 종류(용도) 코드 : 27   선박 종류(용도) 코드명 : 자동차운반선

[다른 질문이 있으신가요?]`);
  }
  
  function ship6(agent) {
    agent.add(`조회된 결과는 아래와 같습니다.
[ 통계 분류 코드 : 06   통계 분류 코드명 : 핫코일선 ]

선박 종류(용도) 코드 : 28   선박 종류(용도) 코드명 : 핫코일운반선

[다른 질문이 있으신가요?]`);
  }
  
  function ship7(agent) {
    agent.add(`조회된 결과는 아래와 같습니다.
[ 통계 분류 코드 : 07   통계 분류 코드명 : 냉동 냉장선 ]

선박 종류(용도) 코드 : 32   선박 종류(용도) 코드명 : 냉동냉장선

[다른 질문이 있으신가요?]`);
  }
  
  function ship8(agent) {
    agent.add(`조회된 결과는 아래와 같습니다.
[ 통계 분류 코드 : 08   통계 분류 코드명 : 일반 화물선 ]

선박 종류(용도) 코드 : 39   선박 종류(용도) 코드명 : 일반화물선

[다른 질문이 있으신가요?]`);
  }
  
  function ship9(agent) {
    agent.add(`조회된 결과는 아래와 같습니다.
[ 통계 분류 코드 : 09   통계 분류 코드명 : 풀 컨테이너선 ]

선박 종류(용도) 코드 : 41   선박 종류(용도) 코드명 : (풀)컨테이너선

[다른 질문이 있으신가요?]`);
  }
  
  function ship10(agent) {
    agent.add(`조회된 결과는 아래와 같습니다.
[ 통계 분류 코드 : 10   통계 분류 코드명 : 세미(혼재) 컨테이너선 ]

선박 종류(용도) 코드 : 42   선박 종류(용도) 코드명 : 세미(혼재)컨테이너선

[다른 질문이 있으신가요?]`);
  }
  
  function ship11(agent) {
    agent.add(`조회된 결과는 아래와 같습니다.
[ 통계 분류 코드 : 11   통계 분류 코드명 : 원유 운반선 ]

선박 종류(용도) 코드 : 51   선박 종류(용도) 코드명 : 원유운반선

[다른 질문이 있으신가요?]`);
  }
  
  function ship12(agent) {
    agent.add(`조회된 결과는 아래와 같습니다.
[ 통계 분류 코드 : 12   통계 분류 코드명 : 석유 정제품 운반선 ]

선박 종류(용도) 코드 : 52   선박 종류(용도) 코드명 : 석유제품운반선
선박 종류(용도) 코드 : 59   선박 종류(용도) 코드명 : 기타 유조선

[다른 질문이 있으신가요?]`);
  }
  
  function ship13(agent) {
    agent.add(`조회된 결과는 아래와 같습니다.
[ 통계 분류 코드 : 13   통계 분류 코드명 : 케미칼 운반선 ]

선박 종류(용도) 코드 : 53   선박 종류(용도) 코드명 : 케미칼 운반선
선박 종류(용도) 코드 : 54   선박 종류(용도) 코드명 : 케미칼가스 운반선

[다른 질문이 있으신가요?]`);
  }
  
  function ship14(agent) {
    agent.add(`조회된 결과는 아래와 같습니다.
[ 통계 분류 코드 : 14   통계 분류 코드명 : LPG, LNG 운반선 ]

선박 종류(용도) 코드 : 55   선박 종류(용도) 코드명 : LPG 운반선
선박 종류(용도) 코드 : 56   선박 종류(용도) 코드명 : LNG 운반선

[다른 질문이 있으신가요?]`);
  }
  
  function ship15(agent) {
    agent.add(`조회된 결과는 아래와 같습니다.
[ 통계 분류 코드 : 16   통계 분류 코드명 : 기타선 ]

선박 종류(용도) 코드 : 61   선박 종류(용도) 코드명 : 견인용예선
선박 종류(용도) 코드 : 62   선박 종류(용도) 코드명 : 이접안용예선
선박 종류(용도) 코드 : 63   선박 종류(용도) 코드명 : 안항예선
선박 종류(용도) 코드 : 64   선박 종류(용도) 코드명 : 기타예선
선박 종류(용도) 코드 : 70   선박 종류(용도) 코드명 : 예부선
선박 종류(용도) 코드 : 71   선박 종류(용도) 코드명 : (모래 운반용)부선
선박 종류(용도) 코드 : 72   선박 종류(용도) 코드명 : (철강재 운반용)부선
선박 종류(용도) 코드 : 73   선박 종류(용도) 코드명 : (원유 운반용)부선
선박 종류(용도) 코드 : 74   선박 종류(용도) 코드명 : (석유제품 운반용)부선
선박 종류(용도) 코드 : 75   선박 종류(용도) 코드명 : (화공약품 운반용)부선
선박 종류(용도) 코드 : 76   선박 종류(용도) 코드명 : (일반화물 운반용)부선
선박 종류(용도) 코드 : 77   선박 종류(용도) 코드명 : (공사 작업용)부선
선박 종류(용도) 코드 : 78   선박 종류(용도) 코드명 : 신조선
선박 종류(용도) 코드 : 79   선박 종류(용도) 코드명 : 기타부선
선박 종류(용도) 코드 : 81   선박 종류(용도) 코드명 : 관공선
선박 종류(용도) 코드 : 82   선박 종류(용도) 코드명 : 경찰정
선박 종류(용도) 코드 : 83   선박 종류(용도) 코드명 : 군함
선박 종류(용도) 코드 : 84   선박 종류(용도) 코드명 : 수상레저기구
선박 종류(용도) 코드 : 91   선박 종류(용도) 코드명 : 연근해어선
선박 종류(용도) 코드 : 92   선박 종류(용도) 코드명 : 원양어선
선박 종류(용도) 코드 : 93   선박 종류(용도) 코드명 : 급유선
선박 종류(용도) 코드 : 94   선박 종류(용도) 코드명 : 급수선
선박 종류(용도) 코드 : 95   선박 종류(용도) 코드명 : 용달선(통선)
선박 종류(용도) 코드 : 96   선박 종류(용도) 코드명 : 준설선
선박 종류(용도) 코드 : 97   선박 종류(용도) 코드명 : 유람선
선박 종류(용도) 코드 : 98   선박 종류(용도) 코드명 : 도선
선박 종류(용도) 코드 : 99   선박 종류(용도) 코드명 : 기타선

[다른 질문이 있으신가요?]`);
  }
  
  
  function nmport(agent) {
    agent.add(`국가 관리 무역항 코드를 선택하셨습니다.
원하시는 지역을 입력하세요.

부산
인천
경인
평택, 당진
동해, 묵호
대산
군산, 장항
목포
여수, 광양
포항
마산
울산`);
  }
  
  function port1(agent) {
    agent.add(`[부산지방해양수산청, 부산항만공사] 탐색 결과 입니다.

[ 항만명 : 부산항 ]
소속코드 : 020   행정분류 : 부산
소속코드 : 021   행정분류 : 감천
소속코드 : 022   행정분류 : 신항

[다른 질문이 있으신가요?]`);
  }
  
  function port2(agent) {
    agent.add(`[인천지방해양수산청, 인천항만공사] 탐색 결과 입니다.

[ 항만명 : 인천항 ]
소속코드 : 030   행정분류 : 인천

[다른 질문이 있으신가요?]`);
  }
  
  function port3(agent) {
    agent.add(`[경인해양수산사무소] 탐색 결과 입니다.

[ 항만명 : 경인항 ]
소속코드 : 050   행정분류 : 경인

[다른 질문이 있으신가요?]`);
  }
  
  function port4(agent) {
    agent.add(`[평택지방해양수산청] 탐색 결과 입니다.

[ 항만명 : 평택, 당진항 ]
소속코드 : 031   행정분류 : 평택

[다른 질문이 있으신가요?]`);
  }
  
  function port5(agent) {
    agent.add(`[동해지방해양수산청] 탐색 결과 입니다.

[ 항만명 : 동해, 묵호항 ]
소속코드 : 200   행정분류 : 동해
소속코드 : 202   행정분류 : 묵호

[다른 질문이 있으신가요?]`);
  }
  
  function port6(agent) {
    agent.add(`[대산지방해양수산청] 탐색 결과 입니다.

[ 항만명 : 대산항 ]
소속코드 : 300   행정분류 : 대산
소속코드 : 303   행정분류 : 당진(화력)

[다른 질문이 있으신가요?]`);
  }
  
  function port7(agent) {
    agent.add(`[군산지방해양수산청] 탐색 결과 입니다.

[ 항만명 : 군산항 ]
소속코드 : 500   행정분류 : 군산

[항만명 : 장항항 ]
소속코드 : 501   행정분류 : 장항

[다른 질문이 있으신가요?]`);
  }
  
  function port8(agent) {
    agent.add(`[목포지방해양수산청] 탐색 결과 입니다.

[ 항만명 : 목포항 ]
소속코드 : 610   행정분류 : 목포
소속코드 : 616   행정분류 : 대불분실
소속코드 : 617   행정분류 : 북항분실

[다른 질문이 있으신가요?]`);
  }
  
  function port9(agent) {
    agent.add(`[여수지방해양수산청, 여수광양항만공사] 탐색 결과 입니다.

[ 항만명 : 여수항 ]
소속코드 : 620   행정분류 : 여수

[ 항만명 : 광양항 ]
소속코드 : 621   행정분류 : 여천
소속코드 : 622   행정분류 : 광양

[다른 질문이 있으신가요?]`);
  }
  
  function port10(agent) {
    agent.add(`[포항지방해양수산청] 탐색 결과 입니다.

[ 항만명 : 포항항 ]
소속코드 : 700   행정분류 : 포항
소속코드 : 701   행정분류 : 신항
소속코드 : 702   행정분류 : 영일만

[다른 질문이 있으신가요?]`);
  }
  
  function port11(agent) {
    agent.add(`[마산지방해양수산청] 탐색 결과 입니다.

[ 항만명 : 마산항 ]
소속코드 : 810   행정분류 : 마산

[다른 질문이 있으신가요?]`);
  }
  
  function port12(agent) {
    agent.add(`[울산지방해양수산청, 울산항만공사] 탐색 결과 입니다.

[ 항만명 : 울산항 ]
소속코드 : 820   행정분류 : 울산
소속코드 : 821   행정분류 : 온산
소속코드 : 822   행정분류 : 미포

[다른 질문이 있으신가요?]`);
  }
  
  function nyport(agent) {
    agent.add(`국가 관리 연안항 코드를 선택하셨습니다.
원하시는 지역을 입력하세요.

서울
강원
충남
전남
경남
제주`);
  }
  
  function portt1(agent) {
    agent.add(`[서울특별시청] 탐색 결과 입니다.
    
[ 항만명 : 서울항 ]   소속코드 : 040   행정분류 : 서울

[다른 질문이 있으신가요?]`);
  }
  
  function portt2(agent) {
    agent.add(`[강원도청] 탐색 결과 입니다.
    
[ 항만명 : 삼척항 ]   소속코드 : 201   행정분류 : 삼척
[ 항만명 : 속초항 ]   소속코드 : 203   행정분류 : 속초
[ 항만명 : 옥계항 ]   소속코드 : 204   행정분류 : 옥계
[ 항만명 : 호산항 ]   소속코드 : 206   행정분류 : 호산

[다른 질문이 있으신가요?]`);
  }
  
  function portt3(agent) {
    agent.add(`[충청남도청] 탐색 결과 입니다.

[ 항만명 : 보령항 ]   소속코드 : 301   행정분류 : 보령
[ 항만명 : 태안항 ]   소속코드 : 302   행정분류 : 태안

[다른 질문이 있으신가요?]`);
  }
  
  function portt4(agent) {
    agent.add(`[전라남도청] 탐색 결과 입니다.

[ 항만명 : 완도항 ]   소속코드 : 611   행정분류 : 완도

[다른 질문이 있으신가요?]`);
  }
  
  function portt5(agent) {
    agent.add(`[경상남도청] 탐색 결과 입니다.

[ 항만명 : 삼천포항 ]   소속코드 : 811   행정분류 : 삼천포
[ 항만명 : 옥포항 ]   소속코드 : 812   행정분류 : 옥포
[ 항만명 : 장승포항 ]   소속코드 : 813   행정분류 : 장승포
[ 항만명 : 진해항 ]   소속코드 : 814   행정분류 : 진해
[ 항만명 : 통영항 ]   소속코드 : 815   행정분류 : 통영
[ 항만명 : 고현항 ]   소속코드 : 816   행정분류 : 고현
[ 항만명 : 하동항 ]   소속코드 : 817   행정분류 : 하동

[다른 질문이 있으신가요?]`);
  }
  
  function portt6(agent) {
    agent.add(`[제주특별자치도] 탐색 결과 입니다.

[ 항만명 : 제주항 ]   소속코드 : 900   행정분류 : 제주
[ 항만명 : 서귀포항 ]   소속코드 : 901   행정분류 : 서귀포

[다른 질문이 있으신가요?]`);
  }
  
  
  function mport(agent) {
    agent.add(`지방 관리 무역항 코드를 선택하셨습니다.
원하시는 지역을 입력하세요.

인천
군산
목포
여수
포항
마산
제주`);
  }
  
  function porttt1(agent) {
    agent.add(`[ 인천 ] 탐색 결과 입니다.

[ 항만명 : 용기포항 ]   소속코드 : 034
[ 항만명 : 연평도항 ]   소속코드 : 035

[다른 질문이 있으신가요?]`);
  }
  
  function porttt2(agent) {
    agent.add(`[ 군산 ] 탐색 결과 입니다.

[ 항만명 : 상왕등도항 ]   소속코드 : 503

[다른 질문이 있으신가요?]`);
  }
  
  function porttt3(agent) {
    agent.add(`[ 목포 ] 탐색 결과 입니다.

[ 항만명 : 흑산도항 ]   소속코드 : 601
[ 항만명 : 가거항리항 ]   소속코드 : 602

[다른 질문이 있으신가요?]`);
  }
  
  function porttt4(agent) {
    agent.add(`[ 여수 ] 탐색 결과 입니다.

[ 항만명 : 거문도항 ]   소속코드 : 631

[다른 질문이 있으신가요?]`);
  }
  
  function porttt5(agent) {
    agent.add(`[ 포항 ] 탐색 결과 입니다.

[ 항만명 : 후포항 ]   소속코드 : 703
[ 항만명 : 울릉항 ]   소속코드 : 704
[ 항만명 : 울릉사동 ]   소속코드 : 705

[다른 질문이 있으신가요?]`);
  }
  
  function porttt6(agent) {
    agent.add(`[ 마산 ] 탐색 결과 입니다.

[ 항만명 : 국도항 ]   소속코드 : 818

[다른 질문이 있으신가요?]`);
  }
  
  function porttt7(agent) {
    agent.add(`[ 제주 ] 탐색 결과 입니다.

[ 항만명 : 추자항 ]   소속코드 : 902
[ 항만명 : 화순항 ]   소속코드 : 903

[다른 질문이 있으신가요?]`);
  }
  
  
  function portfac(agent) {
    agent.add(`항만 시설 사용 목적 코드는 아래와 같습니다.
[ 형식 >> 항만 시설 사용 목적 코드 : 항만 시설 사용 목적 ]
01 : 양하, 적하
02 : 양하
03 : 적하
04 : 수리
05 : 해양사고
06 : 급유
07 : 접안대기
08 : 화물대기
09 : 상가대기
10 : 출항대기
11 : 해상하역
12 : 계선
13 : 수입화물장치
14 : 수출화물장치
15 : 통과선박
98 : 갑문통과
99 : 기타

[다른 질문이 있으신가요?]`);
  }
  
  
  let intentMap = new Map();
  intentMap.set('날씨', getWeather);
  intentMap.set('날씨 - yes', askAgain);
  intentMap.set('날씨 - no', goodBye);
  
  intentMap.set('선별 관제 현황 - custom', getshipinandoutAPI); // shipinout
  intentMap.set('선별 관제 현황 - custom - yes', askAgain);
  intentMap.set('선별 관제 현황 - custom - no', goodBye);

  intentMap.set('여객선', ship1);
  intentMap.set('여객선 - yes', askAgain);
  intentMap.set('여객선 - no', goodBye);

  intentMap.set('산물선', ship2);
  intentMap.set('산물선 - yes', askAgain);
  intentMap.set('산물선 - no', goodBye);

  intentMap.set('원목선', ship3);
  intentMap.set('원목선 - yes', askAgain);
  intentMap.set('원목선 - no', goodBye);

  intentMap.set('시멘트선', ship4);
  intentMap.set('시멘트선 - yes', askAgain);
  intentMap.set('시멘트선 - no', goodBye);

  intentMap.set('자동차선', ship5);
  intentMap.set('자동차선 - yes', askAgain);
  intentMap.set('자동차선 - no', goodBye);

  intentMap.set('핫코일선', ship6);
  intentMap.set('핫코일선 - yes', askAgain);
  intentMap.set('핫코일선 - no', goodBye);

  intentMap.set('냉동냉장선', ship7);
  intentMap.set('냉동냉장선 - yes', askAgain);
  intentMap.set('냉동냉장선 - no', goodBye);

  intentMap.set('일반화물선', ship8);
  intentMap.set('일반화물선 - yes', askAgain);
  intentMap.set('일반화물선 - no', goodBye);

  intentMap.set('풀컨테이너선', ship9);
  intentMap.set('풀컨테이너선 - yes', askAgain);
  intentMap.set('풀컨테이너선 - no', goodBye);

  intentMap.set('세미컨테이너선', ship10);
  intentMap.set('세미컨테이너선 - yes', askAgain);
  intentMap.set('세미컨테이너선 - no', goodBye);

  intentMap.set('원유운반선', ship11);
  intentMap.set('원유운반선 - yes', askAgain);
  intentMap.set('원유운반선 - no', goodBye);

  intentMap.set('석유정제품운반선', ship12);
  intentMap.set('석유정제품운반선 - yes', askAgain);
  intentMap.set('석유정제품운반선 - no', goodBye);

  intentMap.set('케미칼운반선', ship13);
  intentMap.set('케미칼운반선 - yes', askAgain);
  intentMap.set('케미칼운반선 - no', goodBye);

  intentMap.set('LPGLNG운반선', ship14);
  intentMap.set('LPGLNG운반선 - yes', askAgain);
  intentMap.set('LPGLNG운반선 - no', goodBye);

  intentMap.set('기타선', ship15);
  intentMap.set('기타선 - yes', askAgain);
  intentMap.set('기타선 - no', goodBye);
  
  
  intentMap.set('국가관리 무역항', nmport);
  intentMap.set('부산', port1);
  intentMap.set('부산 - yes', askAgain);
  intentMap.set('부산 - no', goodBye);

  intentMap.set('인천', port2);
  intentMap.set('인천 - yes', askAgain);
  intentMap.set('인천 - no', goodBye);

  intentMap.set('경인', port3);
  intentMap.set('경인 - yes', askAgain);
  intentMap.set('경인 - no', goodBye);

  intentMap.set('평택당진', port4);
  intentMap.set('평택당진 - yes', askAgain);
  intentMap.set('평택당진 - no', goodBye);

  intentMap.set('동해묵호', port5);
  intentMap.set('동해묵호 - yes', askAgain);
  intentMap.set('동해묵호 - no', goodBye);

  intentMap.set('대산', port6);
  intentMap.set('대산 - yes', askAgain);
  intentMap.set('대산 - no', goodBye);

  intentMap.set('군산장항', port7);
  intentMap.set('군산장항 - yes', askAgain);
  intentMap.set('군산장항 - no', goodBye);

  intentMap.set('목포', port8);
  intentMap.set('목포 - yes', askAgain);
  intentMap.set('목포 - no', goodBye);

  intentMap.set('여수광양', port9);
  intentMap.set('여수광양 - yes', askAgain);
  intentMap.set('여수광양 - no', goodBye);

  intentMap.set('포항', port10);
  intentMap.set('포항 - yes', askAgain);
  intentMap.set('포항 - no', goodBye);

  intentMap.set('마산', port11);
  intentMap.set('마산 - yes', askAgain);
  intentMap.set('마산 - no', goodBye);

  intentMap.set('울산', port12);
  intentMap.set('울산 - yes', askAgain);
  intentMap.set('울산 - no', goodBye);

  
  intentMap.set('국가관리 연안항', nyport);
  intentMap.set('서울', portt1);
  intentMap.set('서울 - yes', askAgain);
  intentMap.set('서울 - no', goodBye);

  intentMap.set('강원', portt2);
  intentMap.set('강원 - yes', askAgain);
  intentMap.set('강원 - no', goodBye);

  intentMap.set('충남', portt3);
  intentMap.set('충남 - yes', askAgain);
  intentMap.set('충남 - no', goodBye);

  intentMap.set('전남', portt4);
  intentMap.set('전남 - yes', askAgain);
  intentMap.set('전남 - no', goodBye);

  intentMap.set('경남', portt5);
  intentMap.set('경남 - yes', askAgain);
  intentMap.set('경남 - no', goodBye);

  intentMap.set('제주', portt6);
  intentMap.set('제주 - yes', askAgain);
  intentMap.set('제주 - no', goodBye);

  
  intentMap.set('지방관리 무역항', mport);
  intentMap.set('인천2', porttt1);
  intentMap.set('인천2 - yes', askAgain);
  intentMap.set('인천2 - no', goodBye);

  intentMap.set('군산2', porttt2);
  intentMap.set('군산2 - yes', askAgain);
  intentMap.set('군산2 - no', goodBye);

  intentMap.set('목포2', porttt3);
  intentMap.set('목포2 - yes', askAgain);
  intentMap.set('목포2 - no', goodBye);

  intentMap.set('여수2', porttt4);
  intentMap.set('여수2 - yes', askAgain);
  intentMap.set('여수2 - no', goodBye);

  intentMap.set('포항2', porttt5);
  intentMap.set('포항2 - yes', askAgain);
  intentMap.set('포항2 - no', goodBye);

  intentMap.set('마산2', porttt6);
  intentMap.set('마산2 - yes', askAgain);
  intentMap.set('마산2 - no', goodBye);

  intentMap.set('제주2', porttt7);
  intentMap.set('제주2 - yes', askAgain);
  intentMap.set('제주2 - no', goodBye);

  
  intentMap.set('항만시설', portfac);
  intentMap.set('항만시설 - yes', askAgain);
  intentMap.set('항만시설 - no', goodBye);
  
  
  agent.handleRequest(intentMap);
});
