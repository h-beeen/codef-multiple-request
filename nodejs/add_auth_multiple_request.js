const {EasyCodef, EasyCodefConstant} = require('easycodef-node')
const {promisify} = require('util');
const readline = require('readline');
const uuid = require('uuid')

// 클라이언트 정보 및 인증 설정
const clientId = ''
const clientSecret = ''
const publicKey = ''

// 서비스 타입 설정 (정식[0] | 데모[1])
const serviceType = EasyCodefConstant.SERVICE_TYPE_DEMO

// 개인정보 설정
const identity = '19991231' // 생년월일 (19990101 형식 [String))
const userName = '차은우' // 사용자 이름 [String]
const phoneNo = '01012345678' // 전화번호 (01012345678 형식 [String])
const telecom = '0' // 통신사 (SKT/알뜰폰: '0', KT/알뜰폰: '1', LGU+/알뜰폰: '2' [String])

const id = uuid.v1()

// 건강나이 알아보기 요청 파라미터
const healthAge = {
    organization: '0002',
    loginType: '5', // 간편인증
    loginTypeLevel: '1', // 카카오톡
    type: '0',
    id: id,
    identity: identity,
    userName: userName,
    phoneNo: phoneNo,
    telecom: telecom,
    key: 'healthAge',
    endPoint: '/v1/kr/public/pp/hi-nhis-list/review-health-age'
}

// 검진대상 요청 파라미터
const examination = {
    organization: '0002',
    loginType: '5', // 간편인증
    loginTypeLevel: '1', // 카카오톡
    id: id,
    identity: identity,
    userName: userName,
    phoneNo: phoneNo,
    telecom: telecom,
    key: 'examination',
    endPoint: '/v1/kr/public/pp/nhis-list/examination'
}

// 암 문진 정보
const cancer = {
    organization: '0002',
    loginType: '5', // 간편인증
    loginTypeLevel: '1', // 카카오톡
    id: id,
    identity: identity,
    userName: userName,
    phoneNo: phoneNo,
    telecom: telecom,
    key: 'cancer',
    searchStartYear: '2024',
    searchEndYear: '2024',
    endPoint: '/v1/kr/public/pp/questionnaire-information/cancer'
}

// 구강 문진 정보
const oral = {
    organization: '0002',
    loginType: '5', // 간편인증
    loginTypeLevel: '1', // 카카오톡
    id: id,
    identity: identity,
    userName: userName,
    phoneNo: phoneNo,
    telecom: telecom,
    key: 'oral',
    searchStartYear: '2024',
    searchEndYear: '2024',
    endPoint: '/v1/kr/public/pp/questionnaire-information/oral'
}

// ReadLine 설정
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// 간편인증 사용자 완료 여부 체크 Input ReadLine
const user_input = async () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log("[CODEF] 간편인증 요청 시간 : ", new Date());
    while (true) {
        const answer = await promisify(rl.question).call(rl, "[CODEF] 엔드유저에게 카카오톡 간편인증 요청을 송신했습니다. 간편인증을 완료하고 콘솔에 '1'을 입력해주세요. :");
        if (answer === '1') {
            console.log("[CODEF] 간편인증 완료 FLAG");
            break;
        }
    }

    rl.close();
};

// Sleep Method
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const main = async () => {
    console.log('[CODEF] 건강나이, 검진대상, 암, 구강문진 정보를 다건요청을 활용해 조회합니다')

    // 쉬운 코드에프 객체 생성
    codef = new EasyCodef()
    codef.setPublicKey(publicKey)
    codef.setClientInfoForDemo(clientId, clientSecret)

    // 조회 할 API 파라미터 설정
    const requestParams = [healthAge, examination, cancer, oral]

    // 0.5초 간격으로 requestParams를 순회하며 각 API 비동기 호출
    const responseTasks = [];
    for (const requestParam of requestParams) {
        console.log('[CODEF]', requestParam.endPoint, "호출 :", new Date(Date.now()))
        await sleep(500)
        responseTasks.push(codef.requestProduct(requestParam.endPoint, serviceType, requestParam));
    }

    // 호출한 CF-03002를 응답한 API를 검색합니다.
    const addAuthResponse = Promise.any(responseTasks)
    addAuthResponse.then(async (result) => {

        // 추가 인증 응답부 파싱
        const addAuthJsonResponse = JSON.parse(result)
        if (addAuthJsonResponse.result.code !== 'CF-03002') {
            console.warn('[CODEF] 추가인증 요청에 실패했습니다.')
            console.log(addAuthJsonResponse)
            process.exit(1)
        }

        // 유저 간편인증 응답 동기 대기
        await user_input()

        // 2차 요청을 보낼 파라미터 찾기
        const addAuthKey = addAuthJsonResponse.key;
        const secondRequestParam = requestParams.find(param => param.key === addAuthKey)

        // 추가인증 요청부 세팅
        secondRequestParam['twoWayInfo'] = addAuthJsonResponse.data;
        secondRequestParam['is2Way'] = true
        secondRequestParam['simpleAuth'] = '1'

        // 추가요청 (requestCertification)
        return codef.requestCertification(secondRequestParam.endPoint, serviceType, secondRequestParam)
    }).then((firstResponse) => {

            // 최초 요청에 대한 2차 응답부
            const parsedFirstResponse = JSON.parse(firstResponse);

            // 추가인증에 대한 요청이 CF-03002가 내려온다면, 추가인증이 비정상 처리된 상황
            if (parsedFirstResponse.result.code === 'CF-03002') {
                console.warn('[CODEF] 사용자 추가인증이 정상적으로 처리되지 않았습니다.')
                process.exit(1)
            }

            // 최초 요청에 대한 결과 응답 출력
            console.log(parsedFirstResponse, '\n')

            // 최초로 요청했던 모든 응답값에 대한 리스트업
            Promise.all(responseTasks)
                .then(allResponses => {

                    // 전체 응답 중, 응답 대기중인 항목만 필터링
                    const awaitingResponses = allResponses.filter(response => {
                        return JSON.parse(response).key !== parsedFirstResponse.key
                    })

                    // 필터링 된 항목 중 CF-00000(성공) 코드 응답에 대한 출력
                    awaitingResponses.map(res => {
                        const parsedResponse = JSON.parse(res);
                        if (parsedResponse.result.code === 'CF-00000') {
                            console.log(parsedResponse, '\n')
                        } else {
                            console.warn('[CODEF] 비정상 응답 : ', parsedResponse, '\n')
                        }
                    })
                })
                .catch(error => {
                    console.warn(error)
                })
        }
    )
}

main()