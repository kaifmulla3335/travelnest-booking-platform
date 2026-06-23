import { create } from 'zustand';

const useSiteStore = create((set) => ({
  siteName:     'TravelNest',
  tagline:      "India's #1 Travel Platform",
  supportEmail: 'hello@travelnest.in',
  supportPhone: '+919876543210',
  loaded:       false,

  setSiteSettings: (data) => set({
    siteName:     data.siteName     || 'TravelNest',
    tagline:      data.tagline      || "India's #1 Travel Platform",
    supportEmail: data.supportEmail || 'hello@travelnest.in',
    supportPhone: data.supportPhone || '+919876543210',
    loaded: true,
  }),
}));

export default useSiteStore;