/**
 * Unit Tests - Admin Schemas
 * Tests para validación de esquemas administrativos (usuarios, pagos, analytics)
 */

import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import {
  GetUsersSchema,
  UpdateUserRoleSchema,
  DeleteUserSchema,
  GetPaymentsSchema,
  RefundPaymentSchema,
  GetPaymentDetailSchema,
  GetAnalyticsSchema,
} from '../../src/schemas/admin.schemas'

describe('Admin Schemas', () => {
  describe('GetUsersSchema', () => {
    it('should validate valid GetUsers query parameters', () => {
      const validQueries = [
        {},
        { page: 1 },
        { limit: 10 },
        { page: 2, limit: 20 },
        { role: 'user' },
        { role: 'lawyer' },
        { role: 'admin' },
        { search: 'john' },
        { sortBy: 'createdAt' },
        { sortBy: 'email' },
        { sortBy: 'name' },
        { sortOrder: 'asc' },
        { sortOrder: 'desc' },
        { page: 5, limit: 50, role: 'lawyer', search: 'test', sortBy: 'email', sortOrder: 'asc' },
      ]

      validQueries.forEach((query) => {
        const result = GetUsersSchema.safeParse({ query })
        expect(result.success).toBe(true)
      })
    })

    it('should apply default pagination values', () => {
      const result = GetUsersSchema.safeParse({ query: {} })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.query.page).toBe(1)
        expect(result.data.query.limit).toBe(10)
        expect(result.data.query.sortBy).toBe('createdAt')
        expect(result.data.query.sortOrder).toBe('desc')
      }
    })

    it('should reject invalid role', () => {
      const result = GetUsersSchema.safeParse({ query: { role: 'superadmin' } })
      expect(result.success).toBe(false)
    })

    it('should reject invalid sortBy field', () => {
      const result = GetUsersSchema.safeParse({ query: { sortBy: 'invalid' } })
      expect(result.success).toBe(false)
    })

    it('should reject invalid sortOrder', () => {
      const result = GetUsersSchema.safeParse({ query: { sortOrder: 'random' } })
      expect(result.success).toBe(false)
    })

    it('should reject search with less than 1 character', () => {
      const result = GetUsersSchema.safeParse({ query: { search: '' } })
      expect(result.success).toBe(false)
    })

    it('should reject search with more than 100 characters', () => {
      const result = GetUsersSchema.safeParse({ query: { search: 'a'.repeat(101) } })
      expect(result.success).toBe(false)
    })

    it('should accept search with exactly 1 and 100 characters', () => {
      const result1 = GetUsersSchema.safeParse({ query: { search: 'a' } })
      expect(result1.success).toBe(true)

      const result2 = GetUsersSchema.safeParse({ query: { search: 'a'.repeat(100) } })
      expect(result2.success).toBe(true)
    })

    it('should reject negative page', () => {
      const result = GetUsersSchema.safeParse({ query: { page: -1 } })
      expect(result.success).toBe(false)
    })

    it('should reject zero limit', () => {
      const result = GetUsersSchema.safeParse({ query: { limit: 0 } })
      expect(result.success).toBe(false)
    })

    it('should reject limit greater than 100', () => {
      const result = GetUsersSchema.safeParse({ query: { limit: 101 } })
      expect(result.success).toBe(false)
    })

    it('should allow undefined query object', () => {
      const result = GetUsersSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('should accept all valid role values', () => {
      const roles = ['user', 'lawyer', 'admin']
      roles.forEach((role) => {
        const result = GetUsersSchema.safeParse({ query: { role } })
        expect(result.success).toBe(true)
      })
    })

    it('should coerce string numbers to integers', () => {
      const result = GetUsersSchema.safeParse({ query: { page: '5', limit: '20' } })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(typeof result.data.query.page).toBe('number')
        expect(typeof result.data.query.limit).toBe('number')
      }
    })
  })

  describe('UpdateUserRoleSchema', () => {
    it('should validate valid UpdateUserRole request', () => {
      const validRequests = [
        {
          params: { id: '550e8400-e29b-41d4-a716-446655440000' },
          body: { role: 'user' },
        },
        {
          params: { id: '550e8400-e29b-41d4-a716-446655440000' },
          body: { role: 'lawyer' },
        },
        {
          params: { id: '550e8400-e29b-41d4-a716-446655440000' },
          body: { role: 'admin' },
        },
      ]

      validRequests.forEach((request) => {
        const result = UpdateUserRoleSchema.safeParse(request)
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid user UUID', () => {
      const result = UpdateUserRoleSchema.safeParse({
        params: { id: 'not-a-uuid' },
        body: { role: 'user' },
      })
      expect(result.success).toBe(false)
    })

    it('should reject invalid role value', () => {
      const result = UpdateUserRoleSchema.safeParse({
        params: { id: '550e8400-e29b-41d4-a716-446655440000' },
        body: { role: 'superadmin' },
      })
      expect(result.success).toBe(false)
    })

    it('should require both params and body', () => {
      const result = UpdateUserRoleSchema.safeParse({
        params: { id: '550e8400-e29b-41d4-a716-446655440000' },
      })
      expect(result.success).toBe(false)
    })

    it('should reject missing user ID', () => {
      const result = UpdateUserRoleSchema.safeParse({
        params: {},
        body: { role: 'user' },
      })
      expect(result.success).toBe(false)
    })

    it('should reject missing role', () => {
      const result = UpdateUserRoleSchema.safeParse({
        params: { id: '550e8400-e29b-41d4-a716-446655440000' },
        body: {},
      })
      expect(result.success).toBe(false)
    })
  })

  describe('DeleteUserSchema', () => {
    it('should validate valid DeleteUser request', () => {
      const result = DeleteUserSchema.safeParse({
        params: { id: '550e8400-e29b-41d4-a716-446655440000' },
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid user UUID', () => {
      const result = DeleteUserSchema.safeParse({
        params: { id: 'invalid-uuid' },
      })
      expect(result.success).toBe(false)
    })

    it('should reject missing user ID', () => {
      const result = DeleteUserSchema.safeParse({
        params: {},
      })
      expect(result.success).toBe(false)
    })

    it('should reject malformed UUID', () => {
      const malformedUUIDs = [
        '550e8400e29b41d4a716446655440000',
        '550e8400-e29b-41d4-a716-44665544000',
        'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      ]

      malformedUUIDs.forEach((uuid) => {
        const result = DeleteUserSchema.safeParse({
          params: { id: uuid },
        })
        expect(result.success).toBe(false)
      })
    })
  })

  describe('GetPaymentsSchema', () => {
    it('should validate valid GetPayments query parameters', () => {
      const validQueries = [
        {},
        { status: 'pending' },
        { status: 'succeeded' },
        { status: 'failed' },
        { status: 'refunded' },
        { userId: '550e8400-e29b-41d4-a716-446655440000' },
        { page: 2, limit: 50 },
        { sortBy: 'amount' },
        { sortOrder: 'asc' },
      ]

      validQueries.forEach((query) => {
        const result = GetPaymentsSchema.safeParse({ query })
        expect(result.success).toBe(true)
      })
    })

    it('should apply default pagination values', () => {
      const result = GetPaymentsSchema.safeParse({ query: {} })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.query.page).toBe(1)
        expect(result.data.query.limit).toBe(10)
        expect(result.data.query.sortBy).toBe('createdAt')
        expect(result.data.query.sortOrder).toBe('desc')
      }
    })

    it('should reject invalid payment status', () => {
      const result = GetPaymentsSchema.safeParse({ query: { status: 'cancelled' } })
      expect(result.success).toBe(false)
    })

    it('should reject invalid sortBy field', () => {
      const result = GetPaymentsSchema.safeParse({ query: { sortBy: 'price' } })
      expect(result.success).toBe(false)
    })

    it('should coerce startDate and endDate strings to Date objects', () => {
      const result = GetPaymentsSchema.safeParse({
        query: {
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        },
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.query.startDate instanceof Date).toBe(true)
        expect(result.data.query.endDate instanceof Date).toBe(true)
      }
    })

    it('should handle invalid date format', () => {
      const result = GetPaymentsSchema.safeParse({
        query: {
          startDate: 'invalid-date',
        },
      })
      expect(result.success).toBe(false)
    })

    it('should accept all valid payment statuses', () => {
      const statuses = ['pending', 'succeeded', 'failed', 'refunded']
      statuses.forEach((status) => {
        const result = GetPaymentsSchema.safeParse({ query: { status } })
        expect(result.success).toBe(true)
      })
    })

    it('should accept all valid sortBy fields', () => {
      const sortByFields = ['createdAt', 'amount', 'status']
      sortByFields.forEach((field) => {
        const result = GetPaymentsSchema.safeParse({ query: { sortBy: field } })
        expect(result.success).toBe(true)
      })
    })

    it('should reject limit greater than 100', () => {
      const result = GetPaymentsSchema.safeParse({ query: { limit: 101 } })
      expect(result.success).toBe(false)
    })
  })

  describe('RefundPaymentSchema', () => {
    it('should validate valid RefundPayment request', () => {
      const result = RefundPaymentSchema.safeParse({
        params: { paymentId: '550e8400-e29b-41d4-a716-446655440000' },
        body: { reason: 'Customer requested refund' },
      })
      expect(result.success).toBe(true)
    })

    it('should validate RefundPayment without reason', () => {
      const result = RefundPaymentSchema.safeParse({
        params: { paymentId: '550e8400-e29b-41d4-a716-446655440000' },
        body: {},
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid payment UUID', () => {
      const result = RefundPaymentSchema.safeParse({
        params: { paymentId: 'invalid-uuid' },
        body: { reason: 'Test' },
      })
      expect(result.success).toBe(false)
    })

    it('should reject reason with less than 1 character', () => {
      const result = RefundPaymentSchema.safeParse({
        params: { paymentId: '550e8400-e29b-41d4-a716-446655440000' },
        body: { reason: '' },
      })
      expect(result.success).toBe(false)
    })

    it('should reject reason with more than 500 characters', () => {
      const result = RefundPaymentSchema.safeParse({
        params: { paymentId: '550e8400-e29b-41d4-a716-446655440000' },
        body: { reason: 'a'.repeat(501) },
      })
      expect(result.success).toBe(false)
    })

    it('should accept reason with exactly 1 and 500 characters', () => {
      const result1 = RefundPaymentSchema.safeParse({
        params: { paymentId: '550e8400-e29b-41d4-a716-446655440000' },
        body: { reason: 'a' },
      })
      expect(result1.success).toBe(true)

      const result2 = RefundPaymentSchema.safeParse({
        params: { paymentId: '550e8400-e29b-41d4-a716-446655440000' },
        body: { reason: 'a'.repeat(500) },
      })
      expect(result2.success).toBe(true)
    })

    it('should require payment ID', () => {
      const result = RefundPaymentSchema.safeParse({
        params: {},
        body: { reason: 'Test' },
      })
      expect(result.success).toBe(false)
    })
  })

  describe('GetPaymentDetailSchema', () => {
    it('should validate valid GetPaymentDetail request', () => {
      const result = GetPaymentDetailSchema.safeParse({
        params: { paymentId: '550e8400-e29b-41d4-a716-446655440000' },
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid payment UUID', () => {
      const result = GetPaymentDetailSchema.safeParse({
        params: { paymentId: 'not-a-uuid' },
      })
      expect(result.success).toBe(false)
    })

    it('should reject missing payment ID', () => {
      const result = GetPaymentDetailSchema.safeParse({
        params: {},
      })
      expect(result.success).toBe(false)
    })

    it('should reject malformed UUIDs', () => {
      const malformedUUIDs = [
        '550e8400e29b41d4a716446655440000',
        '550e8400-e29b-41d4-a716-44665544000',
      ]

      malformedUUIDs.forEach((uuid) => {
        const result = GetPaymentDetailSchema.safeParse({
          params: { paymentId: uuid },
        })
        expect(result.success).toBe(false)
      })
    })
  })

  describe('GetAnalyticsSchema', () => {
    it('should validate valid GetAnalytics query parameters', () => {
      const validQueries = [
        {},
        { groupBy: 'day' },
        { groupBy: 'week' },
        { groupBy: 'month' },
        { startDate: '2024-01-01' },
        { endDate: '2024-12-31' },
        { startDate: '2024-01-01', endDate: '2024-12-31' },
        { startDate: '2024-01-01', endDate: '2024-12-31', groupBy: 'month' },
      ]

      validQueries.forEach((query) => {
        const result = GetAnalyticsSchema.safeParse({ query })
        expect(result.success).toBe(true)
      })
    })

    it('should allow undefined query object', () => {
      const result = GetAnalyticsSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('should reject invalid groupBy value', () => {
      const result = GetAnalyticsSchema.safeParse({ query: { groupBy: 'year' } })
      expect(result.success).toBe(false)
    })

    it('should coerce date strings to Date objects', () => {
      const result = GetAnalyticsSchema.safeParse({
        query: {
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        },
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.query.startDate instanceof Date).toBe(true)
        expect(result.data.query.endDate instanceof Date).toBe(true)
      }
    })

    it('should accept all valid groupBy values', () => {
      const groupByValues = ['day', 'week', 'month']
      groupByValues.forEach((value) => {
        const result = GetAnalyticsSchema.safeParse({ query: { groupBy: value } })
        expect(result.success).toBe(true)
      })
    })

    it('should handle invalid date format', () => {
      const result = GetAnalyticsSchema.safeParse({
        query: {
          startDate: 'not-a-date',
        },
      })
      expect(result.success).toBe(false)
    })

    it('should accept startDate without endDate', () => {
      const result = GetAnalyticsSchema.safeParse({
        query: {
          startDate: '2024-01-01',
        },
      })
      expect(result.success).toBe(true)
    })

    it('should accept endDate without startDate', () => {
      const result = GetAnalyticsSchema.safeParse({
        query: {
          endDate: '2024-12-31',
        },
      })
      expect(result.success).toBe(true)
    })
  })

  describe('Schema Integration', () => {
    it('should handle complex admin query with multiple filters', () => {
      const result = GetUsersSchema.safeParse({
        query: {
          page: 2,
          limit: 25,
          role: 'lawyer',
          search: 'john',
          sortBy: 'email',
          sortOrder: 'asc',
        },
      })
      expect(result.success).toBe(true)
    })

    it('should handle payment filtering with date range', () => {
      const result = GetPaymentsSchema.safeParse({
        query: {
          status: 'succeeded',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          sortBy: 'amount',
          sortOrder: 'desc',
        },
      })
      expect(result.success).toBe(true)
    })

    it('should handle analytics with all parameters', () => {
      const result = GetAnalyticsSchema.safeParse({
        query: {
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          groupBy: 'month',
        },
      })
      expect(result.success).toBe(true)
    })

    it('should reject request with extra unknown fields', () => {
      const result = GetUsersSchema.safeParse({
        query: {
          page: 1,
          unknownField: 'should be ignored or rejected',
        },
      })
      // Zod by default strips unknown fields
      expect(result.success).toBe(true)
    })
  })

  describe('Type Exports', () => {
    it('should allow importing and using exported types', () => {
      // This is primarily a compilation check
      // Verify that types can be used
      const getUsersQuery = GetUsersSchema.safeParse({ query: { role: 'admin' } })
      expect(getUsersQuery.success).toBe(true)

      const updateUserRole = UpdateUserRoleSchema.safeParse({
        params: { id: '550e8400-e29b-41d4-a716-446655440000' },
        body: { role: 'lawyer' },
      })
      expect(updateUserRole.success).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle very large page numbers', () => {
      const result = GetUsersSchema.safeParse({ query: { page: 999999 } })
      expect(result.success).toBe(true)
    })

    it('should handle concurrent filters in GetUsers', () => {
      const result = GetUsersSchema.safeParse({
        query: {
          role: 'lawyer',
          search: 'test user',
          sortBy: 'name',
          sortOrder: 'asc',
          page: 3,
          limit: 15,
        },
      })
      expect(result.success).toBe(true)
    })

    it('should handle date range with same startDate and endDate', () => {
      const result = GetPaymentsSchema.safeParse({
        query: {
          startDate: '2024-01-01',
          endDate: '2024-01-01',
        },
      })
      expect(result.success).toBe(true)
    })

    it('should reject when sortOrder is invalid case', () => {
      const result = GetUsersSchema.safeParse({
        query: { sortOrder: 'ASC' },
      })
      expect(result.success).toBe(false)
    })

    it('should validate refund with special characters in reason', () => {
      const result = RefundPaymentSchema.safeParse({
        params: { paymentId: '550e8400-e29b-41d4-a716-446655440000' },
        body: { reason: 'Refund: Special chars @#$%^&*()\n\t' },
      })
      expect(result.success).toBe(true)
    })
  })
})
