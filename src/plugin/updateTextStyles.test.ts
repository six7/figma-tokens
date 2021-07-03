import * as setTextValuesOnTarget from './setTextValuesOnTarget';
import updateTextStyles from './updateTextStyles';

const setTextValuesOnTargetSpy = jest.spyOn(setTextValuesOnTarget, 'default');

const typographyTokens = [
    {
        name: 'H1.withValue',
        value: {
            fontFamily: 'Inter',
            fontWeight: 'Bold',
            lineHeight: 'AUTO',
            fontSize: '48',
            paragraphSpacing: '48',
            letterSpacing: '-5%',
        },
    },
    {
        name: 'H1.withValueDescription',
        value: {
            fontFamily: 'Inter',
            fontWeight: 'Regular',
            lineHeight: 'AUTO',
            fontSize: '36',
            paragraphSpacing: '24',
            letterSpacing: '-5%',
        },
        description: 'A standard description',
    },
];

const matchingFigmaStyle = {
    name: 'H1/withValue',
    fontName: {
        family: 'Inter',
        style: 'Bold',
    },
};

describe('updateTextStyles', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('initiates style creation when no match is found and should create', async () => {
        const newStyle = {id: '123'};
        figma.getLocalTextStyles.mockReturnValue([]);
        figma.createTextStyle.mockReturnValue(newStyle);
        await updateTextStyles(typographyTokens, true);
        expect(setTextValuesOnTargetSpy).toHaveBeenCalledTimes(2);
        expect(setTextValuesOnTargetSpy).toHaveBeenLastCalledWith(
            {...newStyle, name: 'H1.withValueDescription'},
            typographyTokens.find((t) => t.name === 'H1.withValueDescription')
        );
    });

    it('calls functions with correct transformed values when a matching style was found', () => {
        figma.getLocalTextStyles.mockReturnValueOnce([matchingFigmaStyle]);
        updateTextStyles(typographyTokens);
        expect(setTextValuesOnTargetSpy).toHaveBeenCalledWith(
            matchingFigmaStyle,
            typographyTokens.find((t) => t.name === 'H1.withValue')
        );
    });
});
