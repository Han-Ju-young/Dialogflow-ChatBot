var request = require('request');
var convert = require('xml-js');

var url = 'http://apis.data.go.kr/1192000/VsslEtrynd2/Info';
var queryParams = '?' + encodeURIComponent('serviceKey') + '=RvS9jmxLAJECGdTDRKoNhuWC2Im4mKQ18jr6Acvbe%2B4VX%2FgKPf4Rs4dxRgBjpA5uq9JSCUPg%2B6CJEUcIV8PzaA%3D%3D'; /* Service Key*/
queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /* */
queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('10'); /* */
queryParams += '&' + encodeURIComponent('prtAgCd') + '=' + encodeURIComponent('020'); /* */
queryParams += '&' + encodeURIComponent('sde') + '=' + encodeURIComponent('20170209'); /* */
queryParams += '&' + encodeURIComponent('ede') + '=' + encodeURIComponent('20170209'); /* */
queryParams += '&' + encodeURIComponent('clsgn') + '=' + encodeURIComponent('9VHZ8'); /* */

request({
    url: url + queryParams,
    method: 'GET'
}, function (error, response, body) {
    // console.log('Status', response.statusCode);
    // console.log('Headers', JSON.stringify(response.headers), '\n\n');
    // console.log('Reponse received', body);

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
    
    console.log('항구청코드: ', prtAgCd);
    console.log('항구청명: ', prtAgNm);
    console.log('입항년도: ', etryptYear);
    console.log('입항횟수: ', etryptCo);
    console.log('호출부호: ', clsgn);
    console.log('선박명: ', vsslNm);
    console.log('선박국가명: ', vsslNltyNm);
    console.log('선박종류명: ', vsslKndNm);
    console.log('입항목적코드: ', etryptPurpsCd);
    console.log('입항목적명: ', etryptPurpsNm);
    console.log('목적지항구명: ', prvsDpmprtPrtNm);
});

`조회된 결과는 아래와 같습니다.
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
    
    [다른 질문이 있으신가요?]`