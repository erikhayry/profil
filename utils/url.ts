export function removeURLParameters(removeParams: string[]) {
    const deleteRegex = new RegExp(removeParams.join('=|') + '=')

    const params = location.search.slice(1).split('&')
    let search = []
    for (let i = 0; i < params.length; i++) if (deleteRegex.test(params[i]) === false) search.push(params[i])

    window.history.replaceState({}, document.title, location.pathname + (search.length ? '?' + search.join('&') : '') + location.hash)
}