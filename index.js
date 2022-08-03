require('dotenv').config()
const needle = require("needle")

// change depending on id of account we want to grab followers from
const userId = "1267191132200591362"
const url = `https://api.twitter.com/2/users/${userId}/followers`;
const bearerToken = process.env.TWITTER_BEARER_TOKEN

async function getFollowers () {
    let followers = []
    let params = {
        "max_results": 1000,
    }

    const options = {
        headers: {
            "User-Agent": "bean3ntoast",
            "authorization": `Bearer ${bearerToken}`
        }
    }

    let hasNextPage = true;
    let nextToken = null;
    console.log("Grabbing followers... sauce")

    while (hasNextPage) {
        let resp = await getPage(params, options, nextToken)
        if (resp && resp.meta && resp.meta.result_count && resp.meta.result_count > 0) {
            if (resp.data) {
                followers.push.apply(followers, resp.data);
            }
            if (resp.meta.next_token) {
                nextToken = resp.meta.next_token;
            } else {
                hasNextPage = false;
            }
        } else {
            hasNextPage = false;
        }
    }

    // console.log(followers)
    // console.log(`Retreived ${followers.length} users`)

    // convert to csv
    let csvHeaders = Object.keys(followers[0])
    let newArr = []
    
    newArr.push(csvHeaders)
    
    for (let i = 0; i < followers.length; i++) {
      let follower = Object.values(followers[i])
      newArr.push(follower)
    }
    
    console.log(newArr.join("\n"))

}



async function getPage (params, options, nextToken) {
    if (nextToken) {
        params.pagination_token = nextToken;
    }

    try {
        const resp = await needle('get', url, params, options);

        if (resp.statusCode != 200) {
            console.log(`${resp.statusCode} ${resp.statusMessage}:\n${resp.body}`);
            return;
        }
        return resp.body;
    } catch (err) {
        throw new Error(`Request failed: ${err}`);
    }
}

getFollowers();