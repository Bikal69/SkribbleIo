export function wordHider(str=''){
    const regex = /\b(\w)(\w*?)(\w)?\b/g;
    const result = str.replace(regex, (match, first, middle, last) => {
        let midIndex = Math.floor(middle.length / 2);
        let maskedMiddle = middle.split('').map((char, i) => (i === midIndex ? char : '_')).join('');
        return first + maskedMiddle + (last ? '_' : '');
    });
    return result;
};


