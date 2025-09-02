import type {
  Adapter,
  AdapterUser,
  VerificationToken,
  AdapterSession,
  AdapterAccount,
} from "@auth/core/adapters"
import type { Pool } from "pg"

function convertBigIntToString(obj: Record<string, unknown> | null | undefined) {
  if (!obj) return null
  const newObj = { ...obj }
  if (newObj.id) newObj.id = String(newObj.id)
  if (newObj.user_id) newObj.user_id = String(newObj.user_id)
  return newObj
}

export function mapExpiresAt<T extends { expires_at?: unknown }>(account: T): Omit<T, 'expires_at'> & { expires_at: number } {
  const { expires_at, ...rest } = account;

  if (typeof expires_at === 'string' || typeof expires_at === 'number') {
    const expiresAtNumber = typeof expires_at === 'string'
      ? parseInt(expires_at, 10)
      : expires_at;

    if (!isNaN(expiresAtNumber)) {
      return {
        ...rest,
        expires_at: expiresAtNumber,
      } as Omit<T, 'expires_at'> & { expires_at: number };
    }
  }

  return account as Omit<T, 'expires_at'> & { expires_at: number };
}

export default function CustomPostgresAdapter(client: Pool): Adapter {
  return {
    async createVerificationToken(verificationToken: VerificationToken): Promise<VerificationToken> {
      const { identifier, expires, token } = verificationToken
      const sql = `
        INSERT INTO verification_token ( identifier, expires, token )
        VALUES ($1, $2, $3)
      `;

      await client.query(sql, [identifier, expires, token])
      return verificationToken
    },
    async useVerificationToken({identifier, token,}: { identifier: string, token: string }): Promise<VerificationToken | null> {
      const sql =
        `
          DELETE FROM verification_token
          WHERE identifier = $1 AND token = $2
          RETURNING identifier, expires, token
        `;
      const result = await client.query(sql, [identifier, token])
      return result.rowCount !== 0 ? result.rows[0] : null
    },
    async createUser(user: AdapterUser): Promise<AdapterUser> {
      const { name, email, emailVerified, image } = user;
      const sql = `
        INSERT INTO "user" (name, email, email_verified, image)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, email_verified AS "emailVerified", image
      `;

      const result = await client.query(sql, [name, email, emailVerified, image,]);

      return convertBigIntToString(result.rows[0]) as unknown as AdapterUser;
    },
    async getUser(id: string): Promise<AdapterUser | null> {
      const sql = `SELECT * FROM "user" WHERE id = $1`;
      const result = await client.query(sql, [id]);
      const user = result.rows[0];

      if (!user) {
        return null;
      }

      return convertBigIntToString(user) as unknown as AdapterUser;
    },
    async getUserByEmail(email: string): Promise<AdapterUser | null> {
      const sql = `SELECT * FROM "user" WHERE email = $1`;
      const result = await client.query(sql, [email]);
      const user = result.rows[0];

      if (!user) {
        return null;
      }

      return convertBigIntToString(user) as unknown as AdapterUser;
    },
    async getUserByAccount({providerAccountId, provider,}: { providerAccountId: string; provider: string; }): Promise<AdapterUser | null> {
      const sql = `
        SELECT u.* FROM "user" u 
        JOIN account a ON u.id = a.user_id
        WHERE a.provider = $1
        AND a.provider_account_id = $2
      `;

      const result = await client.query(sql, [provider, providerAccountId]);
      const user = result.rows[0];

      if (!user) {
        return null;
      }

      return convertBigIntToString(user) as unknown as AdapterUser;
    },
    async updateUser(user: Partial<AdapterUser>): Promise<AdapterUser> {
      const oldUserResult = await client.query(`select * from "user" where id = $1`, [user.id,]);
      const oldUser = oldUserResult.rows[0];

      if (!oldUser) {
        throw new Error("User not found.");
      }

      const newUser = { ...oldUser, ...user };

      const updateSql = `
        UPDATE "user" SET
        name = $2, email = $3, email_verified = $4, image = $5
        WHERE id = $1
        RETURNING id, name, email, email_verified AS "emailVerified", image
      `;

      const updatedUserResult = await client.query(updateSql, [
        newUser.id,
        newUser.name,
        newUser.email,
        newUser.email_verified,
        newUser.image,
      ]);

      return convertBigIntToString(updatedUserResult.rows[0]) as unknown as AdapterUser;
    },
    async linkAccount(account: AdapterAccount): Promise<AdapterAccount | null> {
      const sql = `
          INSERT INTO account
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
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING
              id, user_id AS "userId", provider, type, provider_account_id AS "providerAccountId", access_token,
              expires_at, refresh_token, id_token, scope, session_state, token_type
      `;
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
      ];

      const result = await client.query(sql, params);

      const newAccount = convertBigIntToString(result.rows[0]);

      if (!newAccount) {
        return null;
      }

      return mapExpiresAt(account) as unknown as AdapterAccount;
    },
    async createSession({sessionToken, userId, expires,}: { sessionToken: string; userId: string; expires: Date; }): Promise<AdapterSession> {
      if (userId === undefined) {
        throw Error(`userId is undefined in createSession`);
      }
      const sql = `
        INSERT INTO session (user_id, expires, session_token)
        VALUES ($1, $2, $3)
        RETURNING id, session_token AS "sessionToken", user_id AS "userId", expires
       `;

      const result = await client.query(sql, [userId, expires, sessionToken]);

      return convertBigIntToString(result.rows[0]) as unknown as AdapterSession;
    },
    async getSessionAndUser(sessionToken: string | undefined): Promise<{
      session: AdapterSession
      user: AdapterUser
    } | null> {
      if (sessionToken === undefined) return null

      const sessionResult = await client.query(`SELECT * FROM session WHERE session_token = $1`, [sessionToken]);
      if (sessionResult.rowCount === 0) return null

      const session = convertBigIntToString(sessionResult.rows[0]) as unknown as AdapterSession;

      const userResult = await client.query("SELECT * FROM \"user\" WHERE id = $1", [session.userId]);
      if (userResult.rowCount === 0) return null

      const user = convertBigIntToString(userResult.rows[0]) as unknown as AdapterUser

      return { session, user }
    },
    async updateSession(
      session: Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">
    ): Promise<AdapterSession | null | undefined> {
      const sql = `
        UPDATE session SET expires = $2 WHERE session_token = $1
        RETURNING id, session_token, user_id, expires
      `;
      const result = await client.query(sql, [session.sessionToken, session.expires])
      return convertBigIntToString(result.rows[0]) as unknown as AdapterSession;
    },
    async deleteSession(sessionToken) {
      const sql = `DELETE FROM session WHERE session_token = $1`
      await client.query(sql, [sessionToken])
    },
    async unlinkAccount(partialAccount) {
      const { provider, providerAccountId } = partialAccount
      const sql = `DELETE FROM account WHERE provider_account_id = $1 AND provider = $2`
      await client.query(sql, [providerAccountId, provider])
    },
    async deleteUser(userId: string) {
      await client.query(`DELETE FROM "user" WHERE id = $1`, [userId])
      await client.query(`DELETE FROM session WHERE user_id = $1`, [userId])
      await client.query(`DELETE FROM account WHERE user_id = $1`, [userId])
    },
  }
}