export const navLinks = (texts) => {

    return [

        { text: texts?.Nav_setUpSlideshow, defaultText: 'Set Up Slideshow', path: '/auth/start-show', bottomNav: false, iconType: 'choose' },
        { text: texts?.Nav_albums, defaultText: 'Albums', path: '/auth/albums', bottomNav: true, iconType: 'albums' },
        { text: texts?.Nav_allPhotos, defaultText: 'All Photos', path: '/auth/photos', bottomNav: true, iconType: 'photos' },
        { text: texts?.Nav_slideshow, defaultText: 'Slideshow', path: '/auth/frame', bottomNav: true, iconType: 'slide-show' },
        { text: texts?.Nav_settings, defaultText: 'Settings', path: '/auth/settings', bottomNav: false, iconType: 'settings' },

        // { text: 'Test', path: '/test', admin: 0 }


    ]
}