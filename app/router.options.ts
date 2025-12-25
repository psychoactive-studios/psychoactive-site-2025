import type { RouterConfig } from '@nuxt/schema'

export default <RouterConfig>{
  scrollBehavior() {
    // Return false to disable the router's automatic scrolling.
    // This prevents jumping to the savedPosition when navigating back.
    // Scrolling to the top is now fully controlled manually in the pages' onEnter hook,
    // ensuring it happens at the right time (after the onLeave animation).
    return false
  }
}
