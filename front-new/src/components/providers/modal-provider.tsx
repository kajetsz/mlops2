import React from "react";

import {
    CreateProjectModal,
    EditProjectModal,
    DeleteProjectModal,
    ArchiveRestoreProjectModal,
} from "@/components/modals/projects";

import {
    CreateExperimentModal,
    EditExperimentModal,
    DeleteExperimentModal,
} from "@/components/modals/experiments";

import {
    EditIterationModal,
    DeleteIterationsModal,
} from "@/components/modals/iterations";

import {
    CreateEmptyModelModal,
    CreateModelFromIterationModal,
    DeleteModelModal,
    EditModelModal,
    ArchiveRestoreModelModal,
} from "@/components/modals/models";

import {
    CreateDatasetModal,
    EditDatasetModal,
    DeleteDatasetModal,
    ArchiveRestoreDatasetModal,
} from "@/components/modals/datasets";

const ModalProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            {children}
            <CreateProjectModal />
            <EditProjectModal />
            <DeleteProjectModal />
            <ArchiveRestoreProjectModal />

            <CreateExperimentModal />
            <EditExperimentModal />
            <DeleteExperimentModal />

            <EditIterationModal />
            <DeleteIterationsModal />

            <CreateDatasetModal />
            <EditDatasetModal />
            <DeleteDatasetModal />
            <ArchiveRestoreDatasetModal />

            <CreateEmptyModelModal />
            <CreateModelFromIterationModal />
            <DeleteModelModal />
            <EditModelModal />
            <ArchiveRestoreModelModal />
        </>
    );
};

export default ModalProvider;
