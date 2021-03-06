import React from 'react';
import { useState, useContext } from 'react';
import { Button, Checkbox } from '@mui/material';
import { Row, StyledTextField } from '../config/defaults';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TwitterService from '../services/twitter';
import EAService from '../services/ea';

import { TaskContext, WalletContext } from './context/context';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

import { Task } from './Task';

const doFilterByText = (tasks, search) => {
  return tasks.filter(
    (task) =>
      task.sponsor.includes(search) ||
      task.promoter.includes(search) ||
      task.data?.promoterId?.includes(search) ||
      task.data?.taskHash?.includes(search) ||
      task.title?.includes(search) ||
      task.message?.includes(search) ||
      task.description?.includes(search)
  );
};

const doFilterBySort = (tasks, sort) => {
  if (sort === 'dateDesc') return tasks.sort((a, b) => a.startDate - b.startDate);
  else if (sort === 'dateAsc') return tasks.sort((a, b) => b.startDate - a.startDate);
};

export const OpenTasks = () => {
  const [viewAll, setViewAll] = useState(true);

  // const [filter, setFilter] = useState({
  //   onlyPublic:
  // });

  const { walletAddress } = useContext(WalletContext);
  const { tasks } = useContext(TaskContext);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');

  var filtered = tasks;

  if (filtered?.length) {
    if (!viewAll) filtered = filtered.filter((task) => task.promoter == 0 || task.promoter === walletAddress);
    if (search !== '') filtered = doFilterByText(filtered, search);
    if (sort !== '') filtered = doFilterBySort(filtered, sort);
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
        <div>
          <Checkbox checked={viewAll} onChange={(event) => setViewAll(event.target.checked)} />
          View all tasks
        </div>
        <div>
          <StyledTextField
            variant="filled"
            label="Search"
            value={search}
            onChange={({ target }) => {
              setSearch(target.value);
            }}
          />
        </div>
        <FormControl variant="filled" style={{ width: '150px' }}>
          <InputLabel>Sort by</InputLabel>
          <Select
            value={sort}
            label="Sort by"
            onChange={({ target }) => {
              setSort(target.value);
            }}
          >
            <MenuItem value="dateDesc">Date: Newest</MenuItem>
            <MenuItem value="dateAsc">Date: Oldest</MenuItem>
          </Select>
        </FormControl>
      </div>
      <h2>Open Tasks</h2>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          {filtered.map((task, id) => (
            <Grid item key={id} xs={12} sm={12} md={6} lg={4} xl={4}>
              <Task task={task} taskId={id} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </div>
  );
};
