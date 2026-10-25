package com.subrahmanyapg.task.service;

import com.subrahmanyapg.task.domain.CreateTaskRequest;
import com.subrahmanyapg.task.domain.UpdateTaskRequest;
import com.subrahmanyapg.task.domain.entity.Task;

import java.util.List;
import java.util.UUID;

public interface TaskService {
    Task createTask(CreateTaskRequest request);

    List<Task> listTasks();

    Task updateTask(UUID taskId, UpdateTaskRequest request);

    void deleteTask(UUID taskId);
}
