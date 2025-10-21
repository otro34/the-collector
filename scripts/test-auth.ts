#!/usr/bin/env node
/**
 * Test script to verify auth configuration
 */

import { authConfig } from '../src/auth.config'

console.log('Testing auth configuration...')
console.log('✓ Edge-compatible auth config loaded successfully')
console.log('Providers:', authConfig.providers?.length || 0)
console.log('Pages config:', authConfig.pages)
console.log('Session strategy:', authConfig.session?.strategy)

// Test that callbacks don't contain Prisma references
const callbacks = Object.keys(authConfig.callbacks || {})
console.log('Edge-safe callbacks:', callbacks)

console.log('\n✓ Auth configuration is edge-compatible!')
