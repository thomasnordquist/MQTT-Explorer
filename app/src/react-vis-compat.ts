/**
 * React 19 compatibility shim for react-vis
 *
 * react-vis uses React internals that were removed in React 19.
 * This shim adds back the missing internals to maintain compatibility.
 */
import * as React from 'react'

// Add missing React internals that react-vis expects
if (typeof React !== 'undefined') {
  const internals = (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED

  if (internals) {
    // ReactCurrentOwner was removed in React 19 but react-vis expects it
    if (!internals.ReactCurrentOwner) {
      internals.ReactCurrentOwner = {
        current: null,
      }
    }

    // ReactCurrentDispatcher compatibility
    if (!internals.ReactCurrentDispatcher) {
      internals.ReactCurrentDispatcher = {
        current: null,
      }
    }
  }
}
