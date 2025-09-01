// @ts-nocheck
import type {
  Adapter,
  AdapterUser,
  VerificationToken,
  AdapterSession,
  AdapterAccount,
} from "@auth/core/adapters"
import type { Pool } from "pg"

function convertBigIntToString(obj: Record<string, any> | null | undefined) {
  if (!obj) return null
  const newObj = { ...obj }
  if (newObj.id) newObj.id = String(newObj.id)
  if (newObj.user_id) newObj.user_id = String(newObj.user_id)
  return newObj
}

export function mapExpiresAt(account: any): any {
  const expires_at: number = parseInt(account.expires_at)
  return {
    ...account,
    expires_at,
  }
}

export default function CustomPostgresAdapter(client: Pool): Adapter {
  return {
    async createVerificationToken(
      verificationToken: VerificationToken
    ): Promise<VerificationToken> {
      const { identifier, expires, token } = verificationToken
      const sql = `
        INSERT INTO verification_token ( identifier, expires, token )
        VALUES ($1, $2, $3)
        `
      await client.query(sql, [identifier, expires, token])
      return verificationToken
    },
    async useVerificationToken({
                                 identifier,
                                 token,
                               }: {
      identifier: string
      token: string
    }): Promise<VerificationToken> {
      const sql = `delete from verification_token
      where identifier = $1 and token = $2
      RETURNING identifier, expires, token `
      const result = await client.query(sql, [identifier, token])
      return result.rowCount !== 0 ? result.rows[0] : null
    },

    async createUser(user: Omit<AdapterUser, "id">) {
      const { name, email, emailVerified, image } = user
      const sql = `
        INSERT INTO "user" (name, email, email_verified, image)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, email_verified, image`
      const result = await client.query(sql, [name, email, emailVerified, image])
      return convertBigIntToString(result.rows[0])
    },
    async getUser(id) {
      const sql = `select * from "user" where id = $1`
      const result = await client.query(sql, [id])
      return convertBigIntToString(result.rows[0])
    },
    async getUserByEmail(email) {
      const sql = `select * from "user" where email = $1`
      const result = await client.query(sql, [email])
      return convertBigIntToString(result.rows[0])
    },
    async getUserByAccount({
                             providerAccountId,
                             provider,
                           }): Promise<AdapterUser | null> {
      const sql = `
          select u.* from "user" u join account a on u.id = a.user_id
          where
          a.provider = $1
          and
          a.provider_account_id = $2`

      const result = await client.query(sql, [provider, providerAccountId])
      return convertBigIntToString(result.rows[0])
    },
    async updateUser(user: Partial<AdapterUser>): Promise<AdapterUser> {
      const oldUserResult = await client.query(`select * from "user" where id = $1`, [
        user.id,
      ])
      const oldUser = oldUserResult.rows[0]
      const newUser = { ...oldUser, ...user }

      const updateSql = `
        UPDATE "user" set
        name = $2, email = $3, email_verified = $4, image = $5
        where id = $1
        RETURNING id, name, email, email_verified, image
      `
      const updatedUserResult = await client.query(updateSql, [
        newUser.id,
        newUser.name,
        newUser.email,
        newUser.email_verified,
        newUser.image,
      ])
      return convertBigIntToString(updatedUserResult.rows[0])
    },
    async linkAccount(account: AdapterAccount) {
      console.log("ADAPTER: linkAccount called with:", account); // 👈 ADD THIS
      const sql = `
      insert into account
      (
        user_id,
        provider,
        type,
        provider_account_id,
        access_token,
        expires_at,
        refresh_token,
        id_token,
        scope,
        session_state,
        token_type
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      returning
        id, user_id, provider, type, provider_account_id, access_token,
        expires_at, refresh_token, id_token, scope, session_state, token_type
      `
      const params = [
        account.userId,
        account.provider,
        account.type,
        account.providerAccountId,
        account.access_token,
        account.expires_at,
        account.refresh_token,
        account.id_token,
        account.scope,
        account.session_state,
        account.token_type,
      ]

      const result = await client.query(sql, params)
      return mapExpiresAt(convertBigIntToString(result.rows[0]))
    },
    async createSession({ sessionToken, userId, expires }) {
      if (userId === undefined) {
        throw Error(`userId is undefined in createSession`)
      }
      const sql = `insert into session (user_id, expires, session_token)
      values ($1, $2, $3)
      RETURNING id, session_token, user_id, expires`

      const result = await client.query(sql, [userId, expires, sessionToken])
      return convertBigIntToString(result.rows[0])
    },

    async getSessionAndUser(sessionToken: string | undefined): Promise<{
      session: AdapterSession
      user: AdapterUser
    } | null> {
      if (sessionToken === undefined) return null

      const sessionResult = await client.query(
        `select * from session where session_token = $1`,
        [sessionToken]
      )
      if (sessionResult.rowCount === 0) return null

      const session = convertBigIntToString(sessionResult.rows[0]) as AdapterSession

      const userResult = await client.query("select * from \"user\" where id = $1", [
        session.userId,
      ])
      if (userResult.rowCount === 0) return null

      const user = convertBigIntToString(userResult.rows[0]) as AdapterUser

      return { session, user }
    },
    async updateSession(
      session: Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">
    ): Promise<AdapterSession | null | undefined> {
      const sql = `
        UPDATE session set expires = $2 where session_token = $1
        RETURNING id, session_token, user_id, expires
        `
      const result = await client.query(sql, [session.sessionToken, session.expires])
      return convertBigIntToString(result.rows[0])
    },
    async deleteSession(sessionToken) {
      const sql = `delete from session where session_token = $1`
      await client.query(sql, [sessionToken])
    },
    async unlinkAccount(partialAccount) {
      const { provider, providerAccountId } = partialAccount
      const sql = `delete from account where provider_account_id = $1 and provider = $2`
      await client.query(sql, [providerAccountId, provider])
    },
    async deleteUser(userId: string) {
      await client.query(`delete from "user" where id = $1`, [userId])
      await client.query(`delete from session where user_id = $1`, [userId])
      await client.query(`delete from account where user_id = $1`, [userId])
    },
  }
}