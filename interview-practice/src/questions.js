export const questions=[
 {id:'intro',category:'자기소개',text:'자신을 1분 안에 소개해 주세요.',follow:'지원 직무와 연결되는 나의 강점은 무엇인가요?',guide:'강점 하나 → 그 강점을 보여 준 구체적인 경험 → 입사 후 기여 순서로 말해 보세요.'},
 {id:'motivation',category:'지원 동기',text:'이 직무에 지원한 이유는 무엇인가요?',follow:'이 직무를 준비하며 실제로 해 본 일은 무엇인가요?',guide:'막연한 관심보다 수업·실습·프로젝트의 구체적인 장면과 직무의 연결을 보여 주세요.'},
 {id:'strength',category:'강점',text:'직무에 도움이 될 본인의 강점을 설명해 주세요.',follow:'그 강점으로 문제를 해결한 경험이 있나요?',guide:'상황, 맡은 역할, 행동, 결과와 배운 점을 순서대로 설명해 보세요.'},
 {id:'team',category:'협업',text:'다른 사람과 협력해서 목표를 이룬 경험을 말해 주세요.',follow:'의견이 달랐을 때 어떻게 조율했나요?',guide:'팀 전체의 성과와 내가 직접 한 행동을 구분하고, 상대의 의견을 들은 과정을 담아 보세요.'},
 {id:'failure',category:'성장',text:'실패하거나 실수한 경험과 그 뒤 달라진 점을 말해 주세요.',follow:'같은 상황이 다시 생기면 어떻게 하겠어요?',guide:'실수의 책임을 인정하고 수정 행동과 재발을 막기 위한 습관을 구체적으로 말해 보세요.'},
 {id:'safety',category:'직업 기초',text:'업무 중 안전이나 정확성과 속도가 충돌한다면 어떻게 하겠어요?',follow:'작업 절차를 잘 모를 때 누구에게 어떻게 확인할 건가요?',guide:'안전·규정·확인·보고 순서를 생각하고 직무에 맞는 예시를 덧붙여 보세요.'},
 {id:'learning',category:'학습',text:'새로운 일을 배울 때 본인은 어떻게 익히나요?',follow:'익숙하지 않은 도구를 배운 경험이 있나요?',guide:'배우는 방법을 설명하고 직접 적용한 사례와 확인 방법까지 제시해 보세요.'},
 {id:'future',category:'마무리',text:'입사 후 어떤 동료로 성장하고 싶나요?',follow:'첫 3개월 동안 무엇부터 배우고 싶나요?',guide:'실천 가능한 학습 목표와 협업 태도를 연결해 보세요.'}
];
export function loginEmail(id){const normalized=id.trim().toLowerCase();if(!/^[a-z0-9][a-z0-9_-]{3,23}$/.test(normalized))throw Error('아이디는 영문·숫자로 시작하는 4~24자이며 영문·숫자·밑줄·하이픈을 사용할 수 있습니다.');return normalized+'@students.interview.invalid';}
