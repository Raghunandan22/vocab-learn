import { NextResponse } from 'next/server'

export type ApiResponse<T> = {
  success: true
  data: T
} | {
  success: false
  error: string
  code: string
}

export function success<T>(data: T) {
  return { success: true, data } as const
}

export function fail(error: string, code: string = 'ERROR') {
  return { success: false, error, code } as const
}

export function jsonResponse<T>(response: ApiResponse<T>, status: number = 200) {
  return NextResponse.json(response, { status })
}

export function successResponse<T>(data: T, status: number = 200) {
  return jsonResponse(success(data), status)
}

export function failResponse(error: string, code: string = 'ERROR', status: number = 400) {
  return jsonResponse(fail(error, code), status)
}
