import renderer from 'react-test-renderer';

import Dashboard from '../components/Dashboard';

const colecticaQueryResults= { 'Lifestage' : [{
    agency: 'uk.lha',
    userAttributeValue: 'Third age',
    studyUnitIdentifier: '11fc8ab8-e8ff-4364-bf18-0a99e36b048b'
  },
  {
    agency: 'uk.cls.nextsteps',
    userAttributeValue: 'Adolescence',
    studyUnitIdentifier: '487eae00-70da-46fc-a2e4-c8eb081c5b8f'
  },
  {
    agency: 'uk.cls.nextsteps',
    userAttributeValue: 'Adolescence',
    studyUnitIdentifier: '92f50262-1a83-4ad0-bfb4-6129a0a8d7ad'
  }]
}

it('renders correctly', () => {
  const tree = renderer
    .create(<Dashboard value={0}
        data={colecticaQueryResults}
      />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});