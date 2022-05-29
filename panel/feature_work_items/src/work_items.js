let params = {};
//Entities Initials and styling
let style_map = new Map([["defect", {
    color: 'plum', initial: 'D'
}], ["story", {
    color: 'golden-rod', initial: 'US'
}], ["quality_story", {
    color: 'pale-emerald', initial: 'QS'
}]]);

let getInitials = subtype => {
    return style_map.get(subtype) ?? {
        color: 'red', initial: ''
    };
}

let addParam = paramsPair => {
    if (!paramsPair) {
        return;
    }
    const pair = paramsPair.split('=');
    let name = pair[0];
    let value = decodeURIComponent(pair[1]);
    params[name] = value;
}
//Parsing input by '&', updating 'params' dictionary
let parse = input => {
    return input.substring(1).split('&').forEach(addParam);
}

//Get children entities by parents ID
async function getChildren(featureIds) {
    const response = await fetch(`${params.octane_url}/api/shared_spaces/${params.shared_space}/workspaces/${params.workspace}/work_items/?fields=name&query="parent={id IN ${featureIds}}"`);
    const children = await response.json();
    return children;
}

async function fetchParams() {
    //parsing URL parameters
    params = {};
    let searchParams = parse(document.location.search);
    let hashParams = parse(document.location.hash);
    //Preview panel id = backlog_items
    let parent = document.querySelector('#backlog_items');
    parent.innerHTML = '';
    const featureIds = params['entity_ids'];
    let total_ids = "";
    featureIds.split(',').forEach(id => {
        total_ids += `'${id}',`;
    })
    //Remove last ','
    total_ids = total_ids.slice(0, -1);

    getChildren(total_ids).then(result => {
        result.data.forEach(work_item => {
            //Rendering each child entity
            let {color, initial} = getInitials(work_item.subtype);
            parent.innerHTML += `<div class="flex margin-t--5px">
				<div
					class="grid__entity-initials-label__box margin-l--5px margin-r--5px padding-t--10px bg--${color}"
				>
					<span class="grid__entity-initials-label__text padding-t--5px">${initial}</span>
				</div>
					<a href onclick="navigateToEntity(${work_item.id})">${work_item.id}</a>
					<span class="ellipsis margin-r--10px margin-l--10px">${work_item.name}</span>	
				</div>`
        });
    });
    //On entity's title click, navigate to it by ID
    window.navigateToEntity = entity_id => {
        let message = {
            event_name: 'octane_display_entity',
            workspace: params.workspace,
            shared_space: params.shared_space,
            data: {
                entity_type: 'work_item', entity_id: entity_id.toString(),
            },
        };
        window.parent.postMessage(message, '*');
    }
}

window.onhashchange = fetchParams;
fetchParams();
