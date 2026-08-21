export function tasksReducer(tasks, action){
    switch (action.type){
        case 'added':{
            return[...tasks, action.task];

        }
        case 'moved':{
            const STATUSES = ['To Do', 'In Progress', 'Done'];
            return tasks.map((t) => {
                if (t.id === action.id){
                    const currentIndex = STATUSES.indexOf(t.status);
                    const newIndex = currentIndex + action.direction;
                    if (newIndex >= 0 && newIndex < STATUSES.length){
                        return{...t, status: STATUSES[newIndex]};
                    }
                }
                return t;
            });
        }
        case 'deleted':{
            return tasks.filter((t) => t.id !== action.id);

        }
        default:{
            throw new Error('Unknown action:' + action.type);
        }
    }
}