let recursiveVariableSearch = function (data, vars) {
    if (data == null) {
        data = undefined;
    }

    if (data == undefined || vars.length == 0) {
        return data;
    }

    let needle = vars[0];

    return recursiveVariableSearch(data[needle], vars.slice(1));
}

// Seeks a data in a "tree" object
// Ex: find(object, 'sub.path.to.data', [])
let find = function (data, search, notFoundValue) {
    let tree  = search.split('.');
    let found = recursiveVariableSearch(data, tree);

    if (found == undefined) {
        return notFoundValue;
    }

    return found;
}

export {
    find
};
