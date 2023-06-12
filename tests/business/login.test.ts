import { ZodError } from "zod"
import { UserBusiness } from "../../src/business/UserBusiness"
import { LoginSchema } from "../../src/dtos/user/login.dto"
import { HashManagerMock } from "../mocks/HashManagerMock"
import { IdGeneratorMock } from "../mocks/IdGeneratorMock"
import { TokenManagerMock } from "../mocks/TokenManagerMock"
import { UserDatabaseMock } from "../mocks/UserDatabaseMock"
import { NotFoundError } from "../../src/errors/NotFoundError"

describe("Testando login", () => {
  const userBusiness = new UserBusiness(
    new UserDatabaseMock(),
    new IdGeneratorMock(),
    new TokenManagerMock(),
    new HashManagerMock()
  )

  test("deve gerar um token ao logar", async () => {
    const input = LoginSchema.parse({
      email: "fulano@email.com",
      password: "fulano123"
    })

    const output = await userBusiness.login(input)

    expect(output).toEqual({
      message: "Login realizado com sucesso",
      token: "token-mock-fulano"
    })
  })

  test("e-mail não é string",async () => {
    expect.assertions(1)
    try {
      const input = LoginSchema.parse({
        email: 123,
        password: "fulano123"
      })  
    } catch (error) {
      if (error instanceof ZodError) {
        //console.log(error.issues)
        expect(error.issues).toEqual([
          {
            code: 'invalid_type',
            expected: 'string',
            received: 'number',
            path: [ 'email' ],
            message: 'Expected string, received number'
          }
        ])  
      }
    }
  })

  test("e-mail não foi encontrado",async () => {
    expect.assertions(1)
    try {
      const input = LoginSchema.parse({
        email: "tibas@email.com",
        password: "fulano123"
      })
      const output = await userBusiness.login(input)
    } catch (error) {
      if (error instanceof NotFoundError){
        expect(error.message).toBe("'email' não encontrado")
      }
    }
  })
})
