from easycodefpy import Codef, ServiceType
import uuid, json, copy, asyncio, datetime, sys

# 요청 엔드포인트 설정
examination_endpoint = '/v1/kr/public/pp/nhis-list/examination'
health_age_endpoint = '/v1/kr/public/pp/hi-nhis-list/review-health-age'

# CLIENT SECRET 설정 [ 본 예제는 DEMO 기준 ]
# https://codef.io/account/keys
client_id = ''
client_secret = ''
public_key = ''

# 서비스 타입 (데모 : ServiceType.DEMO | 정식 : ServiceType.PRODUCT)
service_type = ServiceType.DEMO

# 조회 대상 개인정보 설정
# 생년월일 (19990101 형식 [String))
identity = '20000101'

# 사용자 이름 [String]
user_name = '장원영'

# 전화번호 (01012345678 형식 [String])
phone_no = '01012345678'

# 통신사 (SKT/알뜰폰: '0', KT/알뜰폰 = '1', LGU+/알뜰폰 = '2' [String])
telecom = '0'

id = str(uuid.uuid1())

# 건강나이 알아보기 요청부 객체
health_age_parameter = {
    'organization': '0002',
    'loginType': '5',  # 간편인증
    'loginTypeLevel': '1',  # 카카오톡
    'type': '0',
    'id': id,
    'identity': identity,
    'userName': user_name,
    'phoneNo': phone_no,
    'telecom': telecom,
}

examination_parameter = {
    'organization': '0002',
    'loginType': '5',  # 간편인증
    'loginTypeLevel': '1',  # 카카오톡
    'id': id,
    'identity': identity,
    'userName': user_name,
    'phoneNo': phone_no,
    'telecom': telecom
}


async def user_input():
    print("[CODEF] 간편인증 요청 시간 : ", datetime.datetime.now())
    while True:
        flag = await asyncio.to_thread(input, "[CODEF] 엔드유저에게 카카오톡 간편인증 요청을 송신했습니다. 간편인증을 완료하고 콘솔에 '1'을 입력해주세요. : ")
        if flag == '1':
            print("\n[CODEF] 간편인증 완료 FLAG\n")
            break


def main():
    codef = Codef()
    codef.public_key = public_key
    codef.set_demo_client_info(client_id, client_secret)

    # 건강나이 알아보기 1차 요청
    print("\n[CODEF] 건강나이 알아보기 API 1차 요청부 | 요청 \n", health_age_parameter, '\n')
    health_age_auth_response = codef.request_product(health_age_endpoint, service_type, health_age_parameter)

    print("[CODEF] 검진대상 API 다건 요청부 | 요청 \n", examination_parameter, '\n')
    codef.request_product(examination_endpoint, service_type, examination_parameter)

    # 건강나이 알아보기 1차 응답부
    print("[CODEF] 건강나이 알아보기 API 추가인증 응답부\n", health_age_auth_response + '\n')

    # 건강나이 알아보기 1차 응답부 (CF-03002 -> 간편인증 진행 검증)
    if json.loads(health_age_auth_response).get("result").get("code") != "CF-03002":
        print("[CODEF] 오류가 발생했습니다. 추가인증 응답부 코드를 확인해주세요.")
        sys.exit()
    else:
        print("[CODEF] 건강나이 알아보기 1차 요청 정상 성공 검증 완료 (CF-03002)", '\n')

    two_way_info = json.loads(health_age_auth_response).get("data")

    try:
        await asyncio.wait_for(user_input(), timeout=260)
    except asyncio.TimeoutError:
        print("\n\n[CODEF] TIMEOUT 발생 시간 : ", datetime.datetime.now())
        sys.exit()

    health_age_second_param = copy.deepcopy(health_age_parameter)
    health_age_second_param['twoWayInfo'] = two_way_info
    health_age_second_param['is2Way'] = True
    health_age_second_param['simpleAuth'] = '1'

    # 건강나이 알아보기 2차 요청부
    print("[CODEF] 건강나이 알아보기 2차 요청부 | 요청\n", health_age_second_param, '\n')
    health_age_response = await codef.request_certification(health_age_endpoint, service_type, health_age_second_param)

    if not async_task.done():
        print("[CODEF] 검진 대상 API의 응답 대기가 해소되지 않았습니다.")
        sys.exit()

    print("[CODEF] 검진 대상 응답대기 해소 | 응답\n", async_task.result(), '\n')

    health_age_response_code = json.loads(health_age_response).get("result").get("code")
    if health_age_response_code == "CF-03002":
        print("[CODEF] 사용자 1차 인증이 정상적으로 처리되지 않았습니다.")
    elif health_age_response_code == "CF-00000":
        print("[CODEF] 건강나이 알아보기 2차 응답부")
    else:
        print("[CODEF] 오류가 발생했습니다. 오류 메세지를 확인하세요.")
    print(health_age_response)
    sys.exit()


asyncio.get_event_loop().run_until_complete(main())
