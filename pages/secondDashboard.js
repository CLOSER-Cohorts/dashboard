import Layout from '../components/layout';
import GenericDashboard from '../components/Dashboard2';
import { React, useState } from "react";
import fs from 'node:fs'

export async function getServerSideProps(context) {

  const allPostsData = [];

  const token = !!context.req.cookies.token ? context.req.cookies.token : ""

  const username = !!context.req.cookies.username ? context.req.cookies.username : ""

  const homepageRedirect = process.env.HOMEPAGE_REDIRECT;

  const colecticaRepositoryHostname = process.env.COLECTICA_REPOSITORY_HOSTNAME

  var sampleData = null;
  var invalidAgencies = null;
  var orphanPhysicalInstances = null;
  var orphanVariables = null;
  var orphanQuestions = null;
  var physicalInstancesWithNoFileUri = null;
  var questionnairesWithoutExternalInstruments = null;
  var orphanQuestionnaires = null;

  try {
    sampleData = fs.readFileSync('./data/sampleData.txt', 'utf8');
    invalidAgencies = fs.readFileSync('./data/invalidAgencies.txt', 'utf8');
    orphanVariables = fs.readFileSync('./data/orphanVariables.txt', 'utf8');
    orphanPhysicalInstances = fs.readFileSync('./data/orphanPhysicalInstances.txt', 'utf8');
    orphanQuestions = fs.readFileSync('./data/orphanQuestions.txt', 'utf8');
    physicalInstancesWithNoFileUri = fs.readFileSync('./data/physicalInstancesWithNoFileUri.txt', 'utf8');
    questionnairesWithoutExternalInstruments = fs.readFileSync('./data/questionnairesWithoutExternalInstruments.txt', 'utf8');
    orphanQuestionnaires = fs.readFileSync('./data/orphanQuestionnaires.txt', 'utf8');
    } catch (err) {
    console.error(err);
  }

  var dashboardData={ "orphanPhysicalInstances": orphanPhysicalInstances,
      "physicalInstancesWithNoFileUri": physicalInstancesWithNoFileUri,
      "orphanVariables": orphanVariables,
      "orphanQuestionnaires": orphanQuestionnaires,
      "questionnairesWithoutExternalInstruments": questionnairesWithoutExternalInstruments,
      "orphanQuestions": orphanQuestions,
      "invalidAgencies": invalidAgencies
    }       

/*
  try {
    invalidAgencies = fs.readFileSync('./data/invalidAgencies.txt', 'utf8');
    console.log(data);
  } catch (err) {
    console.error(err);
  }

  try {
    orphanVariables = fs.readFileSync('./data/orphanVariables.txt', 'utf8');
    console.log(data);
  } catch (err) {
    console.error(err);
  }

  
  fs.readFile('./data/sampleData.txt', 'utf8', (err, fileData) => {
    console.log(fileData)
    sampleData = !err ? fileData : "NA"
  });
*/
  const colecticaQueryResults = {
    Lifestage: [
        {
          agency: 'uk.cls.bcs70',
          userAttributeValue: 'Pregnancy, birth and infancy',
          studyUnitIdentifier: 'e9e9853d-639c-4c9b-bab1-94b22b84f506'
        },
        {
          agency: 'uk.cls.bcs70',
          userAttributeValue: 'Childhood',
          studyUnitIdentifier: '210db3c9-b0a5-45bc-b911-80779e79d1a8'
        }
    ],
    LifestageDescription: [
        {
          agency: 'uk.cls.bcs70',
          userAttributeValue: 'Pregnancy, birth and infancy',
          studyUnitIdentifier: 'e9e9853d-639c-4c9b-bab1-94b22b84f506'
        },
        {
          agency: 'uk.cls.bcs70',
          userAttributeValue: 'Childhood',
          studyUnitIdentifier: '210db3c9-b0a5-45bc-b911-80779e79d1a8'
        }
    ]
    }
  return {
    props: {
      allPostsData,
      dashboardData,
      token,
      username,
      homepageRedirect,
      colecticaRepositoryHostname,
    },
  };
}

function displayDashboard(value, 
    data, 
    handleChange, 
    selectedValueDetails, 
    updateSelectedValueDetails,
    colecticaRepositoryHostname,
    tabNames) {

        console.log(data)
  
    return <GenericDashboard value={value}
      data={data}
      handleChange={handleChange}
      selectedValueDetails={selectedValueDetails}
      updateSelectedValueDetails={updateSelectedValueDetails}
      colecticaRepositoryHostname={colecticaRepositoryHostname}
      tabNames={tabNames}
    />
  
  }
  
export default function Home({ allPostsData, 
  dashboardData, 
  token, 
  username, 
  colecticaRepositoryHostname, 
  homepageRedirect, 
  physicalInstancesWithNoFileUri }) {

  const [value, setValue] = useState(0);

  const [loginStatus, setLoginStatus] = useState("");

  const [selectedValueDetails, updateSelectedValueDetails] = useState("");

  console.log(colecticaRepositoryHostname)

  //console.log(physicalInstancesWithNoFileUri.split('\n')[0])

  const handleChange = (event, newValue) => {
    setValue(newValue);
    updateSelectedValueDetails("")
  };

  var dashboardData = !!physicalInstancesWithNoFileUri && {"First tab": physicalInstancesWithNoFileUri.split('\n').map(x => Array(x)) }

const displayTable2 = (dataToDisplay) => {

          return <div key={0}>
            <DataTable key={0} data={data}
              allData={data}
              headers={[dataToDisplay[0]]}
              updateDetailsPanel={updateSelectedValueDetails}
              colecticaRepositoryHostname={colecticaRepositoryHostname}
            />
          </div>
        }
        
const tabNames = ["Orphan datasets", "Datasets missing files", "Orphan variables", "Orphan questionnaires", "Questionnaires missing PDFs", "Orphan questions", "Invalid agencies"]
const tabIndexes = ['orphanPhysicalInstances', 
  'physicalInstancesWithNoFileUri', 
  'orphanVariables', 
  'orphanQuestionnaires',
  'questionnairesWithoutExternalInstruments',
  'orphanQuestions',
  'invalidAgencies']

  console.log(dashboardData)

  return (
    <Layout home token={token} username={username} setloginstatus={setLoginStatus} colecticaRepositoryHostname={colecticaRepositoryHostname} homepageRedirect={homepageRedirect}>
      The purpose of this tool is THE SECOND DASHBOARD.
      
      {
      displayDashboard(value, 
            dashboardData, 
            handleChange, 
            selectedValueDetails, 
            updateSelectedValueDetails,
            colecticaRepositoryHostname,
            tabNames)
    }

    </Layout>
  )
}