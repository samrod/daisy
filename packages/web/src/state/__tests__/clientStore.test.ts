// No imports needed; all usage is via require()
describe('clientStore', () => {
  it('should call getData with correct params', () => {
    const { getClientData } = require('../clientStore');
    const { getData } = require('@/lib');
    const callback = jest.fn();
    getClientData('fooKey', callback);
    expect(getData).toHaveBeenCalledWith({ path: 'clients/mockUid', key: 'fooKey', callback });
  });

  it('should call updateData with correct params', async () => {
    const { updateClientData } = require('../clientStore');
    const { updateData } = require('@/lib');
    await updateClientData('barKey', 'barValue');
    expect(updateData).toHaveBeenCalledWith('clients/mockUid/barKey', 'barValue');
  });

  it('should call pushData with correct params', async () => {
    const { pushClientData } = require('../clientStore');
    const { pushData } = require('@/lib');
    await pushClientData('bazKey', 'bazValue');
    expect(pushData).toHaveBeenCalledWith('clients/mockUid/bazKey', 'bazValue');
  });

  it('should not call updateData if uid is missing', async () => {
    const { updateClientData } = require('../clientStore');
    const { updateData } = require('@/lib');
    const { useClientState } = require('@/state');
    useClientState.getState.mockReturnValueOnce({ uid: null });
    await updateClientData('barKey', 'barValue');
    expect(updateData).not.toHaveBeenCalledWith('clients/null/barKey', 'barValue');
  });
});
