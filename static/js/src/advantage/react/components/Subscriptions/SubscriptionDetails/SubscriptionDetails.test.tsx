import React from "react";
import { mount } from "enzyme";
import { QueryClient, QueryClientProvider } from "react-query";

import {
  freeSubscriptionFactory,
  userSubscriptionFactory,
} from "advantage/tests/factories/api";
import SubscriptionDetails from "./SubscriptionDetails";
import { UserSubscription } from "advantage/api/types";
import SubscriptionEdit from "../SubscriptionEdit";

describe("SubscriptionDetails", () => {
  let queryClient: QueryClient;
  let contract: UserSubscription;

  beforeEach(async () => {
    queryClient = new QueryClient();
    contract = userSubscriptionFactory.build();
    queryClient.setQueryData("userSubscriptions", [contract]);
  });

  it("initially shows the content", () => {
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionDetails onCloseModal={jest.fn()} selectedToken="0" />
      </QueryClientProvider>
    );
    expect(wrapper.find("DetailsContent").exists()).toBe(true);
    expect(wrapper.find("SubscriptionEdit").exists()).toBe(false);
  });

  it("can show the edit form", () => {
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionDetails onCloseModal={jest.fn()} selectedToken="0" />
      </QueryClientProvider>
    );
    wrapper.find("Button[data-test='edit-button']").simulate("click");
    expect(wrapper.find("SubscriptionEdit").exists()).toBe(true);
    expect(wrapper.find("DetailsContent").exists()).toBe(false);
  });

  it("closes the edit form when changing subscriptions", () => {
    queryClient.setQueryData("userSubscriptions", [
      userSubscriptionFactory.build(),
      userSubscriptionFactory.build(),
      freeSubscriptionFactory.build(),
    ]);
    // Create a wrapping component to pass props to the inner
    // SubscriptionDetails component. This is needed so that setProps will
    // update the inner component.
    const ProxyComponent = ({ selectedToken }: { selectedToken: string }) => (
      <QueryClientProvider client={queryClient}>
        <SubscriptionDetails
          onCloseModal={jest.fn()}
          selectedToken={selectedToken}
        />
      </QueryClientProvider>
    );
    const wrapper = mount(<ProxyComponent selectedToken="0" />);
    wrapper.find("Button[data-test='edit-button']").simulate("click");
    expect(wrapper.find("SubscriptionEdit").exists()).toBe(true);
    expect(wrapper.find("DetailsContent").exists()).toBe(false);
    wrapper.setProps({ selectedToken: "1" });
    wrapper.update();
    expect(wrapper.find("SubscriptionEdit").exists()).toBe(false);
    expect(wrapper.find("DetailsContent").exists()).toBe(true);
  });

  it("closes the edit form when closing the modal", () => {
    queryClient.setQueryData("userSubscriptions", [
      userSubscriptionFactory.build(),
      userSubscriptionFactory.build(),
      freeSubscriptionFactory.build(),
    ]);
    // Create a wrapping component to pass props to the inner
    // SubscriptionDetails component. This is needed so that setProps will
    // update the inner component.
    const ProxyComponent = ({ modalActive }: { modalActive: boolean }) => (
      <QueryClientProvider client={queryClient}>
        <SubscriptionDetails
          modalActive={modalActive}
          onCloseModal={jest.fn()}
          selectedToken="0"
        />
      </QueryClientProvider>
    );
    const wrapper = mount(<ProxyComponent modalActive={true} />);
    wrapper.find("Button[data-test='edit-button']").simulate("click");
    expect(wrapper.find("SubscriptionEdit").exists()).toBe(true);
    expect(wrapper.find("DetailsContent").exists()).toBe(false);
    wrapper.setProps({ modalActive: false });
    wrapper.update();
    expect(wrapper.find("SubscriptionEdit").exists()).toBe(false);
    expect(wrapper.find("DetailsContent").exists()).toBe(true);
  });

  it("disables the buttons when showing the edit form", () => {
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionDetails onCloseModal={jest.fn()} selectedToken="0" />
      </QueryClientProvider>
    );
    expect(
      wrapper.find("Button[data-test='edit-button']").prop("disabled")
    ).toBe(false);
    expect(
      wrapper.find("Button[data-test='support-button']").prop("disabled")
    ).toBe(false);
    wrapper.find("Button[data-test='edit-button']").simulate("click");
    expect(
      wrapper.find("Button[data-test='edit-button']").prop("disabled")
    ).toBe(true);
    expect(
      wrapper.find("Button[data-test='support-button']").prop("disabled")
    ).toBe(true);
  });

  it("does not display the buttons for a free contract", () => {
    const account = freeSubscriptionFactory.build();
    queryClient.setQueryData("userSubscriptions", [account]);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionDetails onCloseModal={jest.fn()} selectedToken="0" />
      </QueryClientProvider>
    );
    expect(wrapper.find("Button[data-test='edit-button']").exists()).toBe(
      false
    );
    expect(wrapper.find("[data-test='support-button']").exists()).toBe(false);
    expect(wrapper.find("DetailsContent").exists()).toBe(true);
  });

  it("can close the modal", () => {
    const account = freeSubscriptionFactory.build();
    queryClient.setQueryData("userSubscriptions", [account]);
    const onCloseModal = jest.fn();
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionDetails onCloseModal={onCloseModal} selectedToken="0" />
      </QueryClientProvider>
    );
    wrapper.find(".p-modal__close").simulate("click");
    expect(onCloseModal).toHaveBeenCalled();
  });

  it("does not set the modal to active when the cancel modal is visible", () => {
    const onCloseModal = jest.fn();
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionDetails
          modalActive={true}
          onCloseModal={onCloseModal}
          selectedToken="0"
        />
      </QueryClientProvider>
    );
    // Open the edit modal:
    wrapper.find("Button[data-test='edit-button']").simulate("click");
    expect(
      wrapper.find(".p-subscriptions__details").hasClass("is-active")
    ).toBe(true);
    wrapper.find(SubscriptionEdit).invoke("setShowingCancel")(true);
    expect(
      wrapper.find(".p-subscriptions__details").hasClass("is-active")
    ).toBe(false);
  });
});
