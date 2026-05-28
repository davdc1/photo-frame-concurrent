export const navLinks = (texts) => {

    return [

        { text: 'Set Up Slideshow', path: '/auth/start-show', bottomNav: false, iconType: 'choose' },
        { text: 'Albums', path: '/auth/albums', bottomNav: true, iconType: 'albums' },
        { text: 'All Photos', path: '/auth/photos', bottomNav: true, iconType: 'photos' },
        { text: 'Slideshow', path: '/auth/frame', bottomNav: true, iconType: 'slide-show' },
        { text: 'Settings', path: '/auth/settings', bottomNav: false, iconType: 'settings' },

        // { text: 'Test', path: '/test', admin: 0 }


    ]
}