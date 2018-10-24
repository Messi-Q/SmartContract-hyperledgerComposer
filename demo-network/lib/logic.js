/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

 /**
 * SetUpDemo : set up demo by creating example participants and assets
 * @param {org.demo.network.SetUpDemo} tx
 * @transaction
 */

async function SetUpDemo(tx){
    const factory = getFactory();
    const NS = 'org.demo.network';

    const customers = [
        factory.newResource(NS,'Customer','1'),
        factory.newResource(NS,'Customer','2'),
        factory.newResource(NS,'Customer','3')
    ];

    const resources = [
        factory.newResource(NS,'Resource','1001'),
        factory.newResource(NS,'Resource','1002'),
        factory.newResource(NS,'Resource','1003'),
        factory.newResource(NS,'Resource','1004'),
        factory.newResource(NS,'Resource','1005')
    ]

    const regulator = factory.newResource(NS,'Regulator','REGULATOR');
    regulator.firstName = 'Ronnie';
    regulator.lastName = 'Regulator';
    const regulatorRegistry = await getParticipantRegistry(NS + '.Regulator');
    await regulatorRegistry.addAll([regulator]);

    customers.forEach(function(customer,index){
        customer.website = 'Website_' + (index+1);
        customer.token = 1000;
    });
    const customerRegistry = await getParticipantRegistry(NS + '.Customer');
    await customerRegistry.addAll(customers);

    resources.forEach(function(resource,index){
        index++;
        resource.headline = 'headline_' + index;
        resource.readPrice = index * 10;
        resource.ownershipPrice = index * 20;
        resource.owner = factory.newRelationship(NS, 'Customer', (index%3)+1);
        resource.readCount = 0;
        resource.liked = 0;

        if(index < 3){
            resource.coverUrl = 'https://knexjs.org/assets/images/knex.png';
        }else{
            resource.coverUrl = 'http://img0.imgtn.bdimg.com/it/u=3300614666,710181340&fm=26&gp=0.jpg';
        }

    });
    const resourceRegistry = await getAssetRegistry(NS + '.Resource');
    await resourceRegistry.addAll(resources);
}



 /**
 * ShowResourceInfoTransaction : show information of all readable resources across-website
 * @param {org.demo.network.ShowResourceInfoTransaction} tx
 * @returns {org.demo.network.basicResourceInfo[]} The array of basic info.
 * @transaction
 */

async function showResourceInfoTransaction(tx) {
    let assetRegistry = await getAssetRegistry('org.demo.network.Resource');
    let resources = await assetRegistry.getAll();

    var arr = [];

    resources.forEach(resource => {
        const factory = getFactory();
        const basicInfo = factory.newConcept('org.demo.network', 'basicResourceInfo');

        basicInfo.resourceId = resource.resourceId;
        basicInfo.headline = resource.headline;
        basicInfo.coverUrl = resource.coverUrl;
        basicInfo.readPrice = resource.readPrice;
        basicInfo.ownershipPrice = resource.ownershipPrice;
        basicInfo.readCount = resource.readCount;
        basicInfo.liked = resource.liked;

        arr.push(basicInfo);
    });

    //emit event
  	let event = getFactory().newEvent('org.demo.network', 'ShowResourceInfoEvent');
    event.infos = arr;
    emit(event);

    return arr;
}



/**
 * BuyReadRightTransaction : buy the read-right of a resource
 * @param {org.demo.network.BuyReadRightTransaction} tx
 * @transaction
 */
async function buyReadRightTransaction(tx) {
    //check if the intended buyer already have the read right --waiting


    let price = tx.resource.readPrice;

  	//check if the buyer have enough token to buy the read right
  	if(tx.buyer.token < price){ 
  		throw new Error('not enough token to buy the read right!');
    }

    //all check done, begin transaction
    //pay
    tx.resource.owner.token += price;
    tx.buyer.token -= price;

  	tx.resource.readCount++;

  	//update registry
  	let participantRegistry = await getParticipantRegistry('org.demo.network.Customer');
    await participantRegistry.update(tx.buyer);
	await participantRegistry.update(tx.resource.owner);

  	let assetRegistry = await getAssetRegistry('org.demo.network.Resource');
  	await assetRegistry.update(tx.resource);

  	//emit event
  	let event = getFactory().newEvent('org.demo.network', 'BuyReadRightEvent');
    event.resource = tx.resource;
    event.buyer = tx.buyer;
    emit(event);
}



/**
 * BuyOwnershipTransaction : buy the ownership of a resource
 * @param {org.demo.network.BuyOwnershipTransaction} tx
 * @transaction
 */
async function buyOwnershipTransaction(tx){
    let price = tx.resource.ownershipPrice;

    //check if the buyer have enough token to buy the read right
    if(tx.buyer.token < price){
        throw new Error('not enough token to buy the ownership!');
    }

    //all check done, begin transaction
    //pay
    tx.resource.owner.token += price;
    tx.buyer.token -= price;

    //update registry - token
  	let participantRegistry = await getParticipantRegistry('org.demo.network.Customer');
    await participantRegistry.update(tx.buyer);
    await participantRegistry.update(tx.resource.owner);

    //ownerChain extends --waiting
    const factory = getFactory();
    if(!tx.resource.ownerChain){
        const node = factory.newConcept('org.demo.network', 'ownerNode');
        node.userId= tx.resource.owner.userId;
        node.transferTime = 'FIRST_UPLOAD';
        tx.resource.ownerChain = [node];
    }

    const node = factory.newConcept('org.demo.network', 'ownerNode');
    node.userId = tx.buyer.userId;
    node.transferTime = (new Date()).toLocaleString().replace(/\//g,'-');
    tx.resource.ownerChain.push(node);

    //owner transition
    tx.resource.owner = tx.buyer;

     //update registry - resource owner
    let assetRegistry = await getAssetRegistry('org.demo.network.Resource');
    await assetRegistry.update(tx.resource);

    //emit event
    let event = getFactory().newEvent('org.demo.network', 'BuyOwnershipEvent');
    event.resource = tx.resource;
    event.buyer = tx.buyer;
    emit(event);
}


/**
 * RechargeTransaction : customer recharge
 * @param {org.demo.network.RechargeTransaction} tx
 * @transaction
 */

async function RechargeTransaction(tx){
    tx.customer.token += tx.rechargeToken;

    //update registry - token
  	let participantRegistry = await getParticipantRegistry('org.demo.network.Customer');
    await participantRegistry.update(tx.customer);

    //emit event
    let event = getFactory().newEvent('org.demo.network', 'RechargeEvent');
    event.customer = tx.customer;
    event.rechargeToken = tx.rechargeToken;
    event.afterRechargeToken = tx.customer.token;
    emit(event);
}


/**
 * CheckReadRightTransaction : check if the intended reader have the read right
 * param {org.demo.network.CheckReadRightTransaction} tx
 * returns {Boolean}
 * @transaction
 */

// async function CheckReadRightTransaction(tx) {
//     const connection = new BusinessNetworkConnection();
//     await connection.connect('admin@demo-network');

//     // build the special query for historian records --waiting 搜索语句不对，还需确定记录中购买的资源是当前查询的资源
//     let q1 = connection.buildQuery(
//         `SELECT org.hyperledger.composer.system.HistorianRecord
//         WHERE (transactionType == 'BuyReadRightTransaction' AND participantInvoking == _$participant )`
//     );

//     let result = await connection.query(q1,{participant:tx.reader});

//     let event = getFactory().newEvent('org.demo.network', 'CheckReadRightEvent');
//     event.resource = tx.resource;
//     event.reader = tx.reader;
//     if(result != none)
//         event.access = true;
//     else event.access = false;
//     emit(event);

//     if(result != none)
//         return true;
//     else return false;
// }


/**
 * CheckOwnershipTransaction : check if the intended reader have the owner right
 * @param {org.demo.network.CheckOwnershipTransaction} tx
 * @returns {Boolean}
 * @transaction
 */

async function CheckOwnershipTransaction(tx){

    let result = false;
    if(tx.customer === tx.resource.owner){
        result = true;
    }

    let event = getFactory().newEvent('org.demo.network', 'CheckOwnershipEvent');
    event.resource = tx.resource;
    event.customer = tx.customer;
    event.ownership = result;
    emit(event);

    return result;
}


