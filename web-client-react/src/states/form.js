export const defaultAction = {
    id: null,
    key: null,
    name: null,
    text: null,
    value: null
}

export const defaultActor = {
    id: null,
    name: null
}

export const defaultChar = {
    id: null,
    name: null,
    actor: defaultActor
}

export const defaultImg = {
    dimensions: {
        height: 0,
        width: 0
    },
    path: null,
    src: null
}

export const defaultVideo = {
    id: null,
    img: null,
    title: null,
    year: null
}

export const defaultLocation = {
    lat: 40.758896,
    lng: -73.98513
}

export const initialFormState = {
    action: defaultAction,
    actions: [],
    char: defaultChar,
    chars: [],
    img: defaultImg,
    location: defaultLocation,
    video: defaultVideo,
    videos: []
}
