export default function convertOpacityToFigma(value: string) {
    if (value.match(/(\d+%)/)) {
        return Number(value.match(/(\d+%)/)[0].slice(0, -1)) / 100;
    }
    return Number(value);
}
