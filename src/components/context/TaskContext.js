import './connector.css';
import { createContext, useMemo, useState, useContext, useCallback } from 'react';

import { Web3Context } from './Web3Context';
// import { useMoralisQuery } from 'react-moralis';

import Moralis from 'moralis';

export const TaskContext = createContext({
  tasks: null,
  updateTasks: null,
});

const getMoralisTaskData = async () => {
  const TaskObject = Moralis.Object.extend('Task');
  const query = new Moralis.Query(TaskObject);
  const results = await query.find();
  return results;
};

window.getMoralisTaskData = getMoralisTaskData;

export const TaskConnector = ({ children }) => {
  // console.log('rendering', 'TaskConnector');
  const [tasks, setTasks] = useState([]);

  const { contract, chainId } = useContext(Web3Context);
  // const { walletAddress } = useContext(WalletContext);

  const updateTasks = () => {
    // console.log('calling updateTasks');
    // updateTaskCount();
    contract
      .getAllTaskAndState()
      .then((_tasks, _pendingRevokeTime) => {
        _tasks = _tasks[0].map((task, id) => {
          // console.log('parsing', task);
          // console.log('data', );
          let data = {};
          try {
            data = JSON.parse(task.data);
          } catch (e) {}

          return {
            ...task,
            id: id,
            startDate: task.startDate * 1000,
            endDate: task.endDate * 1000,
            vestingTerm: task.vestingTerm * 1000,
            data: data,
            // task.state = getTaskState(task);
            // pendingRevokeTime: _pendingRevokeTime[id]
          };
        });

        getMoralisTaskData()
          .then((queries) => {
            queries.forEach((query) => {
              // console.log('parsing query', query);
              let task = _tasks[query.attributes.taskId];
              if (!task) return;
              task.title = query.attributes.title;
              task.description = query.attributes.description;
              task.message = query.attributes.message;
              task.sponsorUsername = query.attributes.username;
              // console.log('added to ', task.id, task);
            });

            setTasks(_tasks);
          })
          .catch(console.error);

        setTasks(_tasks);
      })
      .catch(console.error);
  };

  useMemo(() => {
    // console.log('calling init Tasks');
    updateTasks();
    contract.on(contract.filters.TaskCreated(), updateTasks);
  }, [chainId]);

  const context = {
    tasks: tasks,
    updateTasks: updateTasks,
  };

  return <TaskContext.Provider value={context}>{children}</TaskContext.Provider>;
};
