export const intervalUnits = {
    SECONDS: 'SECONDS',
    MINUTES: 'MINUTES',
    HOURS: 'HOURS'
}

export const unitToSeconds = {
    [intervalUnits.SECONDS]: 1,
    [intervalUnits.MINUTES]: 60,
    [intervalUnits.HOURS]: 3600
}

export const sessionOrderTypes = {
    RANDOM: 'RANDOM',
    SEQUENTIAL: 'SEQUENTIAL'
}

export const transitionTypes = {
    SLIDE: 'SLIDE',
    FADE: 'FADE'
}

export const transitionClasses = {
    [transitionTypes.SLIDE]: { OUT: 'slide-out', IN: 'slide-in' },
    [transitionTypes.FADE]: { OUT: 'fade-out', IN: 'fade-in' }
}

export const orientationTypes = {
    LANDSCAPE: 'LANDSCAPE',
    PORTRAIT: 'PORTRAIT',
    SQUARE: 'SQUARE'
}

export const analysisStatuses = {
    PENDING: 'PENDING',
    PROCESSING: 'PROCESSING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED'
}

export const localStorageKeys = {
    FRAME_APP_STORE: 'frame_app_store',
    PLAY_LIST_DATA: 'playListData',
    PHOTO_SESSION_ID: 'photoSessionId',
    SLIDE_SHOW_INTERVAL: 'slideShowInterval',
    TRANSITION_TYPE: 'transitionType',
    INTERVAL_UNIT: 'intervalUnit',
    THEME: 'theme',
    SESSION_ORDER: 'sessionOrder'
}

export const playListDataKeys = {
    CURRENT_PLAYLIST_ALBUM: 'current_playlist_album',
    PLAY_NEXT_ALBUM: 'play_next_album',
    PLAYLIST: 'playlist',
    USER_ID: 'userId'
}