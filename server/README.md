노드메일러로 메일 보내기
어제는 되다가 오늘은 로그인이 안돼서 이 글 보고 oauth인증 방식으로 해결함[nodemailer와 gmail로 메일 발송하기 ㅡ OAuth2](https://blog.eunsatio.io/develop/nodemailer%EC%99%80-gmail%EB%A1%9C-%EB%A9%94%EC%9D%BC-%EB%B0%9C%EC%86%A1%ED%95%98%EA%B8%B0-%E3%85%A1-OAuth2)

jwt 이용한 로그인
- [프론트에서 안전하게 로그인 처리하기 (ft. React)](https://velog.io/@yaytomato/%ED%94%84%EB%A1%A0%ED%8A%B8%EC%97%90%EC%84%9C-%EC%95%88%EC%A0%84%ED%95%98%EA%B2%8C-%EB%A1%9C%EA%B7%B8%EC%9D%B8-%EC%B2%98%EB%A6%AC%ED%95%98%EA%B8%B0#%EB%A1%9C%EA%B7%B8%EC%9D%B8-%EB%A7%8C%EB%A3%8C-%EB%A1%9C%EA%B7%B8%EC%9D%B8-%EC%97%B0%EC%9E%A5-%EC%B2%98%EB%A6%AC%ED%95%98%EA%B8%B0)
- [Refresh Token과 Sliding Sessions를 활용한 JWT의 보안 전략](https://blog.ull.im/engineering/2019/02/07/jwt-strategy.html)


NestJS
- main.ts : 여기서 시작, AppModule에서 어플리케이션 생성
- AppModule : = root module, 다른 모듈 import 함. 모듈은 앱의 부분으로 하나의 역할을 담당한다. 인증담당 모듈이면 users module 이런식으로

- cli 사용 controller 생성```nest g(generate) co(controller)```

- controller : url에 대한 요청을 받고 함수를 실행함(실행할 함수-비지니스 로직은 서비스에 있다), express router와 같다. NestJS에서는 @Get(url) 과 같은 데코레이터를 사용한다
  - 데코레이터 : 클래스나 함수를 꾸미는 함수(?), 꾸며줄 함수나 클래스와 붙어있어야 한다
- service : 비지니스 로직을 가지고 있다

- NestJS는 컨트롤러와 비지니스 로직을 분리한 구조를 사용한다. 컨트롤러는 url 요청을 받고 함수를 실행하는 것만 담당하고, 서비스에서 비지니스 로직을 담당한다.


- 데코레이터로 필요한 값을 가져온다
  - @Body(), @Query(key), @Param(key)
- handler(@Param(key) value: type, @Body() bodyData) {
  // param[key] = value,
  // bodyData 가져올 수 있다
}

- get /search가 get /:id 보다 아래 있으면 search를 id로 생각함

- single resposivility principle : things should do one thing, one thing only and do it well
  - 컨트롤러는 url 매핑, 요청 받고, Query나 Body넘겨주는 역할
  - 서비스는 로직 담당

- cli로 서비스 생성 ```nest g(generate) s(service)```
- 생성된 .spec은 테스트파일

- entities : 서비스로 보내고 받을 클래스(인터페이스)를 export, 실제 db의 모델을 만들어야함

- nestJS 에서 컨트롤러에서 서비스 접근하려면 import 하는게 아니라 controller 내에서 요청한다, 컨트롤러 클래스의 컨스트럭터함수에 넣어서 받아옴

- 데이터가 없을 때 에러처리 throw new NotFoundException() -> nestJS에 들어있다, 404 statusCode 반환

- 요청 body값 검사필요 

- movieData에 타입 지정하기 위해 dto 필요, 요청 보낼때 필요한 데이터 구조, 각 요청마다 그에 대한 dto필요하다
  - nestJS가 들어오는 쿼리에 대해 유효성 검사 가능하게 함 -> dto에서 class-validator, main.ts에서 ValidationPipe 사용
  - 들어온 param 값은 모두 string인데 다른 타입으로 바꿀수있다 -> main.ts validationPipe에 transform: true(class-transform이 해줌)
  - patch같은 경우 일부만 필요, PartialType사용

  - nestJS에서 앱은 여러개의 모듈로 구성됨. app.module은 appController랑 AppService만 가지고 있어야함, app모듈이 다른 모듈 임포트함

- dependency injection?  
  - movies.controller에서 임포트하는 건 실제 MoviesService가 아니라 그냥 타입임
  - module에서 provider가 임포트하고 있음, provider안에 sevice 넣어두면 controller에 주입한다. 그래서 타입을 추가하는 것만으로도 작동함

- nestJS는 express 위에서 동작함
  - getAll(@Req() req, @Res() res) 처럼 res, req 에 접근가능, 하지만 직접적으로 express 객체 사용하는 게 좋은 방식은 아님, nestJS는 express를 사용하거나, fastify 사용할수도 있기 때문

- 유닛테스트 : getAll(), deleteOne()같은 메서드, 유닛 하나를 테스트
- e2e테스트 : end to end 전체 시스템 테스트, 사용자의 동작 하나, 버튼 클릭하면 다른 페이지로 이동한다 이런거


### providers
- @Injectable() 데코레이터 달고있는 js 클래스, -> @Injectable() 데코레이터는 nest에게 이 클래스는 nest provider야 하고 알려주는 메타데이터 붙이는 역할을 함, 의존성을 주입할 수 있다

- 의존성 객체(dependencies)는 어떤 클래스가 동작하기 위해 필요한 서비스나 객체를 의미합니다. 그리고 의존성 주입 패턴은 이 의존성 객체를 직접 생성하지 않고 외부 어딘가에서 받아오도록 요청하는 패턴입니다.(angular의 의존성주입)[https://angular.kr/guide/dependency-injection]

### module
```ts
@Module({
  providers:[] // 인젝터가 객체로 생성할 프로바이더, 해당 모듈내에서 공유됨
  controllers: [], //해당 모듈 내에서 정의된 컨트롤러들, 객체화되어야할 것들
  imports: [],// 해당 모듈에서 필요로 하는 프로바이더를 익스포트하는 모듈
  exports: [], // 다른 모듈에서 사용할 수 있게 해당 모듈에서 내보내는 프로바이더 목록 -> export 해야 다른 모듈에서 해당 모듈 임포트 했을 때 프로바이더 목록을 사용할 수 있다, exports 하는 프로바이더는 public interface, API라고 생각하자
})
```
- 모듈 스코프 내에 provider들이 캡슐화된다

- 모든 모듈은 싱글톤이고, 다른 모듈에서 재사용된다. CatsModule 에서 CatsService를 export 하면 CatsModule을 import하는 모듈에서는 CatsService에 접근할 수 있다. CatsService 인스턴스는 하나만 생성되고 공유된다

- module클래스 또한 다른 provider(서비스 등)를 주입할 수 있다(configuration 목적)
- 모듈클래스 자체는 provider로서 주입할 수 없다 circular dependency때문

- 글로벌 모듈 @Global() helpers, database connection 등에 어디서나 사용할 수 있는 provider들을 사용하기 위해

### Middleware
- 라우트 핸들러 실행전 호출되는 함수, req,res에 접근가능, 요청-응답 사이클 종료
- 커스텀 Nest middleware는 @Injectable 데코레이터 달고있는 함수나 클래스, NestMiddleware인터페이스를 implement함