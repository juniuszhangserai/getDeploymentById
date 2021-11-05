// https://github.com/nodeca/js-yaml
const yaml = require('js-yaml');
const fs   = require('fs');


const core = require('@actions/core');
const github = require('@actions/github');

require('dotenv').config()

let myToken = "";

if (process.env.TOKEN)
{
   myToken = process.env.TOKEN;
}
else
{
   myToken = core.getInput('github-token');
}

let reSha = "";

if (process.env.reSha)
{
  reSha = process.env.reSha;
}
else
{
  reSha = core.getInput('github_sha');
}

let envName = "";

if (process.env.envName)
{
  envName = process.env.envName;
}
else
{
   envName = core.getInput('env-name');
}


async function listDeployments(reSha) 
{
    // This should be a token with access to your repository scoped in as a secret.
  // The YML workflow will need to set myToken with the GitHub Secret Token
  // myToken: ${{ secrets.GITHUB_TOKEN }}
  // https://help.github.com/en/actions/automating-your-workflow-with-github-actions/authenticating-with-the-github_token#about-the-github_token-secret
  //const myToken = core.getInput('myToken');

  const octokit = github.getOctokit(myToken)

  try
  {
  //Check if milestone exists
    const { data: deployments } = await octokit.repos.listDeployments({
    owner: github.context.owner,
    repo: github.context.repo,
    sha: reSha
    })

    return deployments.reverse();

  }
  catch(error) 
  {
    // Handle the promise
    console.log("ERROR listing Deployments: " + error.message)    
    return false;
  };

}

async function getDeployments(envName)
{
  var deployments = await listDeployments(reSha);

  for(i = 0 ;i < deployments.length;i++)
  {
    if (deployments[i].environment == envName)
    {
        console.log('For environment ' + deployments[i].environment)
        const deploymentId = deployments[i].id
        const deploymentCreatedAt = deployments[i].created_at
        const deploymentUpdatedAt = deployments[i].updated_at
        console.log("Deployment ID: " + deploymentId)
        console.log("Created at: " + deploymentCreatedAt)
        console.log("Updated at: " + deploymentUpdatedAt)


        core.setOutput("deploymentId", deploymentId);
    }
    
  }


}

getDeployments(envName);