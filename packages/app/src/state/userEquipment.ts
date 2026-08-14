import {useSuspenseQuery} from "@tanstack/react-query";
import UserEquipment from "@/model/userEquipment";
import queryClient from "@/queryClient";
import userEquipmentStorage from "@/storage/userEquipment";
import {FilterFn} from "@/utils/func";

export const userEquipmentQueryKey = () => ["userEquipment"];
export const fetchUserEquipment = async () => userEquipmentStorage.list();

export const userEquipmentItemQueryKey = (id: string): [string, string] => ["userEquipmentItem", id];
export const fetchUserEquipmentItem = async (id: string) => userEquipmentStorage.get(id);
export const queryUserEquipmentItem = ({ queryKey: [, id]}: { queryKey: [string, string]}) => fetchUserEquipmentItem(id);

export const useUserEquipment = (filter?: FilterFn<UserEquipment>): UserEquipment[] => {
    const {data} = useSuspenseQuery({ queryKey: userEquipmentQueryKey(), queryFn: fetchUserEquipment });

    if (!data) {
        throw new Error("Unable to load equipment");
    }

    return filter ? data.filter(filter) : data;
};

export const useUserEquipmentItem = (id: string): UserEquipment => {
    const {data} = useSuspenseQuery({ queryKey: userEquipmentItemQueryKey(id), queryFn: queryUserEquipmentItem });

    if (!data) {
        throw new Error("Unable to load equipment item");
    }

    return data;
};

export const saveUserEquipment = async (id: string, userEquipment: UserEquipment) => {
    await userEquipmentStorage.save(id, userEquipment);
    await queryClient.invalidateQueries({queryKey: userEquipmentItemQueryKey(id)});
    await queryClient.invalidateQueries({queryKey: userEquipmentQueryKey()});
};

export const deleteUserEquipment = async (id: string) => {
    await userEquipmentStorage.delete(id);
    await queryClient.invalidateQueries({queryKey: userEquipmentItemQueryKey(id)});
    await queryClient.invalidateQueries({queryKey: userEquipmentQueryKey()});
};
