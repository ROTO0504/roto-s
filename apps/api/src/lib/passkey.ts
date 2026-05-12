import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server"
import type {
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/types"

import type { Bindings, Passkey } from "../types"

import { base64UrlToBytes, bytesToBase64Url } from "./base64"

const SOLO_USER_ID = new TextEncoder().encode("roto-s-admin")

async function listPasskeys(env: Bindings): Promise<Passkey[]> {
  const { results } = await env.DB.prepare("SELECT * FROM passkeys").all<Passkey>()
  return results ?? []
}

export async function buildRegistrationOptions(env: Bindings): Promise<PublicKeyCredentialCreationOptionsJSON> {
  const existing = await listPasskeys(env)
  return await generateRegistrationOptions({
    rpName: env.RP_NAME,
    rpID: env.RP_ID,
    userID: SOLO_USER_ID,
    userName: "roto",
    userDisplayName: "roto",
    attestationType: "none",
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
    },
    excludeCredentials: existing.map((p) => ({
      id: p.credential_id,
      transports: p.transports ? (JSON.parse(p.transports) as AuthenticatorTransportFuture[]) : undefined,
    })),
  })
}

export async function verifyRegistration(
  env: Bindings,
  body: RegistrationResponseJSON,
  expectedChallenge: string,
  label: string | undefined,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const verification = await verifyRegistrationResponse({
    response: body,
    expectedChallenge,
    expectedOrigin: env.ORIGIN,
    expectedRPID: env.RP_ID,
    requireUserVerification: false,
  })
  if (!verification.verified || !verification.registrationInfo) return { ok: false, reason: "verification_failed" }

  const { credential } = verification.registrationInfo
  const credentialID = credential.id
  const publicKey = bytesToBase64Url(credential.publicKey)
  const counter = credential.counter
  const transports = body.response.transports ? JSON.stringify(body.response.transports) : null

  await env.DB.prepare(
    "INSERT INTO passkeys (credential_id, public_key, counter, transports, label, created_at) VALUES (?, ?, ?, ?, ?, ?)",
  )
    .bind(credentialID, publicKey, counter, transports, label ?? null, Date.now())
    .run()
  return { ok: true }
}

export async function buildAuthenticationOptions(env: Bindings): Promise<PublicKeyCredentialRequestOptionsJSON> {
  const existing = await listPasskeys(env)
  return await generateAuthenticationOptions({
    rpID: env.RP_ID,
    userVerification: "preferred",
    allowCredentials: existing.map((p) => ({
      id: p.credential_id,
      transports: p.transports ? (JSON.parse(p.transports) as AuthenticatorTransportFuture[]) : undefined,
    })),
  })
}

export async function verifyAuthentication(
  env: Bindings,
  body: AuthenticationResponseJSON,
  expectedChallenge: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const credentialID = body.id
  const stored = await env.DB.prepare("SELECT * FROM passkeys WHERE credential_id = ?")
    .bind(credentialID)
    .first<Passkey>()
  if (!stored) return { ok: false, reason: "unknown_credential" }

  const verification = await verifyAuthenticationResponse({
    response: body,
    expectedChallenge,
    expectedOrigin: env.ORIGIN,
    expectedRPID: env.RP_ID,
    credential: {
      id: stored.credential_id,
      publicKey: base64UrlToBytes(stored.public_key),
      counter: stored.counter,
      transports: stored.transports ? (JSON.parse(stored.transports) as AuthenticatorTransportFuture[]) : undefined,
    },
    requireUserVerification: false,
  })
  if (!verification.verified) return { ok: false, reason: "verification_failed" }

  await env.DB.prepare("UPDATE passkeys SET counter = ?, last_used_at = ? WHERE credential_id = ?")
    .bind(verification.authenticationInfo.newCounter, Date.now(), credentialID)
    .run()
  return { ok: true }
}
